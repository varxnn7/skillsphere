const User = require('../models/User');
const Gig = require('../models/Gig');
const Proposal = require('../models/Proposal');
const Payment = require('../models/Payment');
const Dispute = require('../models/Dispute');
const FreelancerProfile = require('../models/FreelancerProfile');
const ClientProfile = require('../models/ClientProfile');
const Notification = require('../models/Notification');
const AdminLog = require('../models/AdminLog');

// @desc    Get administrative dashboard statistics (nested structure)
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalFreelancers = await User.countDocuments({ role: 'freelancer' });
    const totalClients = await User.countDocuments({ role: 'client' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const newThisMonth = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });
    const verifiedFreelancers = await FreelancerProfile.countDocuments({ isVerified: true });

    const totalGigs = await Gig.countDocuments({});
    const openGigs = await Gig.countDocuments({ status: 'open' });
    const inProgressGigs = await Gig.countDocuments({ status: 'in-progress' });
    const completedGigs = await Gig.countDocuments({ status: 'completed' });
    const cancelledGigs = await Gig.countDocuments({ status: 'cancelled' });
    const pendingApprovalGigs = await Gig.countDocuments({ isApproved: false });

    const releasedPayments = await Payment.find({ status: 'released' }).lean();
    const escrowPayments = await Payment.find({ status: 'escrow' }).lean();
    const totalRevenue = releasedPayments.reduce((sum, p) => sum + (p.platformFee || 0), 0);
    const pendingEscrow = escrowPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalTransactions = await Payment.countDocuments({});

    // Monthly revenue over the last 12 months
    const monthlyRevenue = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      const monthNum = d.getMonth();

      const start = new Date(year, monthNum, 1);
      const end = new Date(year, monthNum + 1, 1);

      const paymentsInMonth = await Payment.find({
        status: 'released',
        releasedAt: { $gte: start, $lt: end }
      }).lean();

      const revSum = paymentsInMonth.reduce((sum, p) => sum + (p.platformFee || 0), 0);
      monthlyRevenue.push({
        month: monthName,
        year,
        revenue: revSum
      });
    }

    const disputesTotal = await Dispute.countDocuments({});
    const disputesOpen = await Dispute.countDocuments({ status: 'open' });
    const disputesUnderReview = await Dispute.countDocuments({ status: 'under-review' });
    const disputesResolved = await Dispute.countDocuments({ status: { $in: ['resolved-client', 'resolved-freelancer', 'closed'] } });

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          clients: totalClients,
          freelancers: totalFreelancers,
          admins: totalAdmins,
          newThisMonth,
          verifiedFreelancers
        },
        gigs: {
          total: totalGigs,
          open: openGigs,
          inProgress: inProgressGigs,
          completed: completedGigs,
          cancelled: cancelledGigs,
          pendingApproval: pendingApprovalGigs
        },
        payments: {
          totalRevenue,
          monthlyRevenue,
          pendingEscrow,
          totalTransactions
        },
        disputes: {
          total: disputesTotal,
          open: disputesOpen,
          underReview: disputesUnderReview,
          resolved: disputesResolved
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get list of users with filters & search & pagination
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getUsers = async (req, res, next) => {
  try {
    const { role, status, isVerified, search, page = 1, limit = 10 } = req.query;

    const query = {};

    if (role) {
      query.role = role;
    }

    if (status) {
      query.isSuspended = status === 'suspended';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Handle isVerified logic
    if (isVerified) {
      const isVer = isVerified === 'true';
      const freelancers = await FreelancerProfile.find({ isVerified: isVer }).select('user').lean();
      const freelancerUserIds = freelancers.map(f => f.user.toString());
      query._id = { $in: freelancerUserIds };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Populate verification states manually
    const populatedUsers = await Promise.all(
      users.map(async (u) => {
        let verified = false;
        if (u.role === 'freelancer') {
          const profile = await FreelancerProfile.findOne({ user: u._id }).select('isVerified').lean();
          verified = profile ? profile.isVerified : false;
        }
        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          avatar: u.avatar,
          isSuspended: u.isSuspended || false,
          isEmailVerified: u.isEmailVerified,
          isVerified: verified,
          createdAt: u.createdAt
        };
      })
    );

    res.status(200).json({
      success: true,
      count: populatedUsers.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        totalResults: total
      },
      users: populatedUsers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Suspend user account
// @route   PUT /api/admin/users/:id/suspend
// @access  Private (Admin only)
exports.suspendUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot suspend admin users' });
    }

    user.isSuspended = true;
    await user.save();

    // Notify User
    await Notification.create({
      user: user._id,
      type: 'account_suspended',
      title: 'Account Suspended',
      message: 'Your account has been suspended by the administrator.',
      link: '/'
    });

    // Log action
    await AdminLog.create({
      admin: req.user.id,
      action: 'SUSPEND_USER',
      targetType: 'User',
      targetId: user._id,
      details: `Suspended account for user email: ${user.email}`
    });

    res.status(200).json({ success: true, message: 'User account suspended successfully', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reactivate user account
// @route   PUT /api/admin/users/:id/activate
// @access  Private (Admin only)
exports.activateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isSuspended = false;
    await user.save();

    // Notify User
    await Notification.create({
      user: user._id,
      type: 'account_activated',
      title: 'Account Reactivated',
      message: 'Your account has been reactivated by the administrator.',
      link: '/'
    });

    // Log action
    await AdminLog.create({
      admin: req.user.id,
      action: 'ACTIVATE_USER',
      targetType: 'User',
      targetId: user._id,
      details: `Reactivated account for user email: ${user.email}`
    });

    res.status(200).json({ success: true, message: 'User account reactivated successfully', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify freelancer (give badge)
// @route   PUT /api/admin/users/:id/verify
// @access  Private (Admin only)
exports.verifyUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role !== 'freelancer') {
      return res.status(400).json({ success: false, message: 'Only freelancer users can be verified' });
    }

    let profile = await FreelancerProfile.findOne({ user: user._id });
    if (!profile) {
      profile = await FreelancerProfile.create({ user: user._id });
    }

    profile.isVerified = true;
    profile.verificationBadge = true;
    await profile.save();

    // Notify freelancer
    await Notification.create({
      user: user._id,
      type: 'profile_verified',
      title: 'Profile Verified',
      message: 'Your profile has been verified! A blue badge has been added to your profile.',
      link: `/freelancer/profile`
    });

    // Log action
    await AdminLog.create({
      admin: req.user.id,
      action: 'VERIFY_FREELANCER',
      targetType: 'User',
      targetId: user._id,
      details: `Granted verification badge to freelancer user email: ${user.email}`
    });

    res.status(200).json({ success: true, message: 'Freelancer verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user account & cascade cleanups
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete admin users' });
    }

    const userId = user._id;

    // Delete related profiles
    await FreelancerProfile.findOneAndDelete({ user: userId });
    await ClientProfile.findOneAndDelete({ user: userId });

    // Delete gigs posted by user (if client)
    await Gig.deleteMany({ client: userId });

    // Delete proposals submitted by user (if freelancer)
    await Proposal.deleteMany({ freelancer: userId });

    // Delete notifications
    await Notification.deleteMany({ user: userId });

    // Finally delete User
    await User.findByIdAndDelete(userId);

    // Log action
    await AdminLog.create({
      admin: req.user.id,
      action: 'DELETE_USER',
      targetType: 'User',
      targetId: userId,
      details: `Permanently deleted user email: ${user.email}`
    });

    res.status(200).json({ success: true, message: 'User and all associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all gigs (admin approval management)
// @route   GET /api/admin/gigs
// @access  Private (Admin only)
exports.getGigs = async (req, res, next) => {
  try {
    const { isApproved, status, search, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    if (isApproved !== undefined) {
      query.isApproved = isApproved === 'true';
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Gig.countDocuments(query);

    // Sort: pending approval first (isApproved: false first), then newest first
    const gigs = await Gig.find(query)
      .populate('client', 'name email avatar')
      .sort({ isApproved: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.status(200).json({
      success: true,
      count: gigs.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        totalResults: total
      },
      gigs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve gig posting
// @route   PUT /api/admin/gigs/:id/approve
// @access  Private (Admin only)
exports.approveGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    gig.isApproved = true;
    await gig.save();

    // Notify client
    await Notification.create({
      user: gig.client,
      type: 'gig_approved',
      title: 'Your Gig Has Been Approved',
      message: `Your gig listing "${gig.title}" has been approved and is now public.`,
      link: `/client/my-gigs`
    });

    // Log action
    await AdminLog.create({
      admin: req.user.id,
      action: 'APPROVE_GIG',
      targetType: 'Gig',
      targetId: gig._id,
      details: `Approved gig title: ${gig.title}`
    });

    res.status(200).json({ success: true, message: 'Gig approved successfully', gig });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject gig posting
// @route   PUT /api/admin/gigs/:id/reject
// @access  Private (Admin only)
exports.rejectGig = async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, message: 'Please provide a reason for gig rejection' });
    }

    const gig = await Gig.findById(req.params.id);
    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    gig.isApproved = false;
    gig.status = 'cancelled';
    await gig.save();

    // Notify client with reason
    await Notification.create({
      user: gig.client,
      type: 'gig_rejected',
      title: 'Your Gig Listing Has Been Rejected',
      message: `Your gig listing "${gig.title}" was rejected. Reason: ${reason}`,
      link: `/client/my-gigs`
    });

    // Log action
    await AdminLog.create({
      admin: req.user.id,
      action: 'REJECT_GIG',
      targetType: 'Gig',
      targetId: gig._id,
      details: `Rejected gig title: ${gig.title}. Reason: ${reason}`
    });

    res.status(200).json({ success: true, message: 'Gig rejected and cancelled successfully', gig });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get monthly revenue metrics (Area charts)
// @route   GET /api/admin/revenue
// @access  Private (Admin only)
exports.getRevenue = async (req, res, next) => {
  try {
    const monthlyData = [];

    // Construct 12 months array
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      const monthNum = d.getMonth();

      const start = new Date(year, monthNum, 1);
      const end = new Date(year, monthNum + 1, 1);

      const paymentsInMonth = await Payment.find({
        status: 'released',
        releasedAt: { $gte: start, $lt: end }
      }).lean();

      const revenue = paymentsInMonth.reduce((sum, p) => sum + (p.platformFee || 0), 0);
      const transactions = paymentsInMonth.length;

      monthlyData.push({
        month: monthName,
        year,
        revenue,
        transactions
      });
    }

    // Group by category to find category revenue
    const categoryData = await Payment.aggregate([
      { $match: { status: 'released' } },
      {
        $lookup: {
          from: 'gigs',
          localField: 'gig',
          foreignField: '_id',
          as: 'gigDetails'
        }
      },
      { $unwind: '$gigDetails' },
      {
        $group: {
          _id: '$gigDetails.category',
          value: { $sum: '$platformFee' }
        }
      },
      { $project: { name: '$_id', value: 1, _id: 0 } }
    ]);

    res.status(200).json({ success: true, monthlyData, categoryData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get top earners freelancers list
// @route   GET /api/admin/top-freelancers
// @access  Private (Admin only)
exports.getTopFreelancers = async (req, res, next) => {
  try {
    const earningsData = await Payment.aggregate([
      { $match: { status: 'released' } },
      {
        $group: {
          _id: '$freelancer',
          totalEarnings: { $sum: '$freelancerAmount' }
        }
      },
      { $sort: { totalEarnings: -1 } },
      { $limit: 10 }
    ]);

    const topFreelancers = await Promise.all(
      earningsData.map(async (item) => {
        const user = await User.findById(item._id).select('name email avatar').lean();
        const profile = await FreelancerProfile.findOne({ user: item._id }).select('skills averageRating').lean();

        // Calculate completed gigs count (gigs with accepted proposals by this freelancer where gig status is completed)
        const acceptedProposals = await Proposal.find({ freelancer: item._id, status: 'accepted' }).select('gig').lean();
        const gigIds = acceptedProposals.map(p => p.gig);
        const completedGigs = await Gig.countDocuments({ _id: { $in: gigIds }, status: 'completed' });

        return {
          user,
          totalEarnings: item.totalEarnings,
          skills: profile ? profile.skills.map(s => s.name) : [],
          completedGigs,
          rating: profile ? profile.averageRating : 0
        };
      })
    );

    res.status(200).json({ success: true, freelancers: topFreelancers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
