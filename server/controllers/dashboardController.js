const Gig = require('../models/Gig');
const Proposal = require('../models/Proposal');
const User = require('../models/User');
const FreelancerProfile = require('../models/FreelancerProfile');
const ClientProfile = require('../models/ClientProfile');

// @desc    Get dashboard statistics based on user role
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const role = req.user.role;
    const userId = req.user.id;

    if (role === 'client') {
      // 1. Posted Gigs
      const postedGigsCount = await Gig.countDocuments({ client: userId });

      // 2. Active Projects
      const activeProjectsCount = await Gig.countDocuments({ client: userId, status: 'in-progress' });

      // 3. Total Spent (sum of bidAmount on accepted proposals for client's gigs)
      const clientGigs = await Gig.find({ client: userId }).select('_id');
      const clientGigIds = clientGigs.map(g => g._id);

      const acceptedProposals = await Proposal.find({
        gig: { $in: clientGigIds },
        status: 'accepted'
      });
      const totalSpent = acceptedProposals.reduce((sum, p) => sum + (p.bidAmount || 0), 0);

      // 4. Pending Payments (sum of pending milestones in active proposals)
      // Since milestones are stored in the proposal or gig, let's sum milestones for client's accepted proposals
      const pendingPayments = acceptedProposals.reduce((sum, p) => {
        const milestones = p.milestones || [];
        return sum + milestones.reduce((mSum, m) => mSum + (m.amount || 0), 0);
      }, 0);

      // 5. Recent Activities
      // Let's get the 5 most recent proposals submitted to the client's gigs
      const recentProposals = await Proposal.find({ gig: { $in: clientGigIds } })
        .populate('freelancer', 'name')
        .populate('gig', 'title')
        .sort({ createdAt: -1 })
        .limit(5);

      const activities = recentProposals.map(p => ({
        id: p._id,
        type: 'proposal',
        title: 'New proposal received',
        desc: `${p.freelancer?.name || 'A freelancer'} applied to your "${p.gig?.title || 'Gig'}" posting.`,
        time: formatTimeAgo(p.createdAt),
        color: 'bg-[#3B82F6]'
      }));

      // Fallback activities if none exist yet to keep UI clean
      if (activities.length === 0) {
        activities.push({
          id: 'welcome',
          type: 'verification',
          title: 'Welcome to SkillSphere!',
          desc: 'Post a new gig to begin finding hyperlocal freelancers.',
          time: 'Just now',
          color: 'bg-brand-indigo'
        });
      }

      return res.status(200).json({
        success: true,
        stats: [
          { title: 'Posted Gigs', value: postedGigsCount.toString(), color: 'text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20' },
          { title: 'Active Projects', value: activeProjectsCount.toString(), color: 'text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/20' },
          { title: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, color: 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20' },
          { title: 'Pending Payments', value: `₹${pendingPayments.toLocaleString()}`, color: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20' }
        ],
        activities
      });

    } else if (role === 'freelancer') {
      // 1. Profile views (from schema tracking)
      const freelancerProfile = await FreelancerProfile.findOne({ user: userId });
      const profileViews = freelancerProfile ? (freelancerProfile.views || 0).toString() : '0';

      // 2. Proposals Sent
      const proposalsSentCount = await Proposal.countDocuments({ freelancer: userId });

      // 3. Active Gigs
      const activeGigsCount = await Proposal.countDocuments({ freelancer: userId, status: 'accepted' });

      // 4. Total Earnings (sum of accepted proposals bidAmount)
      const acceptedProposals = await Proposal.find({ freelancer: userId, status: 'accepted' });
      const totalEarnings = acceptedProposals.reduce((sum, p) => sum + (p.bidAmount || 0), 0);

      // 5. Monthly Earnings Tracker (last 6 months)
      const monthlyEarnings = getMonthlyEarnings(acceptedProposals);

      // 6. Hyperlocal Opportunities matching freelancer
      // Search open gigs in the same category or skills
      const query = { status: 'open', isApproved: true };
      if (freelancerProfile && freelancerProfile.skills && freelancerProfile.skills.length > 0) {
        const skillsList = freelancerProfile.skills.map(s => s.name);
        query.skills = { $in: skillsList.map(s => new RegExp(`^${s}$`, 'i')) };
      }
      
      const matchingGigs = await Gig.find(query)
        .populate('client', 'name')
        .sort({ createdAt: -1 })
        .limit(3);

      const localJobs = matchingGigs.map(g => ({
        id: g._id,
        title: g.title,
        distance: g.isRemote ? 'Remote' : g.location || 'Local area',
        client: g.client?.name || 'Recruiter',
        budget: `₹${g.budgetMin} - ₹${g.budgetMax}`
      }));

      return res.status(200).json({
        success: true,
        stats: [
          { title: 'Profile Views', value: profileViews, color: 'text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20' },
          { title: 'Proposals Sent', value: proposalsSentCount.toString(), color: 'text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/20' },
          { title: 'Active Gigs', value: activeGigsCount.toString(), color: 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20' },
          { title: 'Total Earnings', value: `₹${totalEarnings.toLocaleString()}`, color: 'text-brand-indigo bg-brand-indigo/10 border-brand-indigo/20' }
        ],
        chartData: monthlyEarnings,
        localJobs
      });

    } else if (role === 'admin') {
      // 1. Total Registered Users
      const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });

      // 2. Active Gigs
      const activeGigsCount = await Gig.countDocuments({ status: 'in-progress' });

      // 3. Platform Revenue (10% commission on accepted proposal transactions)
      const allAccepted = await Proposal.find({ status: 'accepted' });
      const totalSpentVal = allAccepted.reduce((sum, p) => sum + (p.bidAmount || 0), 0);
      const platformRevenue = Math.round(totalSpentVal * 0.1);

      // 4. Disputes Pending (mocked)
      const disputesPending = 0;

      // 5. Recent signups list
      const recentUsers = await User.find({ role: { $ne: 'admin' } })
        .sort({ createdAt: -1 })
        .limit(5);

      const recentSignups = recentUsers.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role === 'client' ? 'Client' : 'Freelancer',
        status: u.isVerified ? 'verified' : 'pending',
        joined: new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      }));

      return res.status(200).json({
        success: true,
        stats: [
          { title: 'Total Registered Users', value: totalUsers.toLocaleString(), color: 'text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/20' },
          { title: 'Total Platform Revenue', value: `₹${platformRevenue.toLocaleString()}`, color: 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20' },
          { title: 'Active Gigs', value: activeGigsCount.toString(), color: 'text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/20' },
          { title: 'Disputes Pending', value: disputesPending.toString(), color: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20' }
        ],
        recentSignups
      });
    }

    res.status(400).json({ success: false, message: 'Invalid User Role' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper: Format relative time
function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = Math.floor(seconds / 31536000);

  if (interval >= 1) return `${interval}y ago`;
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return `${interval}mo ago`;
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return `${interval}d ago`;
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return `${interval}h ago`;
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return `${interval}m ago`;
  return 'just now';
}

// Helper: Group earnings by month for last 6 months
function getMonthlyEarnings(acceptedProposals) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const result = [];
  
  // Get last 6 months list
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    result.push({
      month: months[d.getMonth()],
      monthNum: d.getMonth(),
      year: d.getFullYear(),
      earnings: 0
    });
  }

  // Aggregate proposal payments
  acceptedProposals.forEach(p => {
    const pDate = new Date(p.updatedAt);
    const pMonth = pDate.getMonth();
    const pYear = pDate.getFullYear();

    const match = result.find(r => r.monthNum === pMonth && r.year === pYear);
    if (match) {
      match.earnings += (p.bidAmount || 0);
    }
  });

  // Strip helper fields for Recharts
  return result.map(r => ({
    month: r.month,
    earnings: r.earnings
  }));
}
