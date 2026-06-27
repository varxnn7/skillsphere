const Proposal = require('../models/Proposal');
const Gig = require('../models/Gig');
const User = require('../models/User');
const sendEmail = require('../utils/email');

// @desc    Submit a proposal to a gig
// @route   POST /api/proposals
// @access  Private (Freelancer only)
exports.submitProposal = async (req, res, next) => {
  try {
    const { gigId, coverLetter, bidAmount, estimatedDays, milestones, attachments } = req.body;

    if (!gigId || !coverLetter || !bidAmount || !estimatedDays) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Check if gig exists and is open
    const gig = await Gig.findById(gigId).populate('client');
    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    if (gig.status !== 'open') {
      return res.status(400).json({ success: false, message: 'This gig is no longer accepting proposals' });
    }

    // Check if freelancer already applied
    const alreadyApplied = await Proposal.findOne({ gig: gigId, freelancer: req.user.id });
    if (alreadyApplied) {
      return res.status(400).json({ success: false, message: 'You have already submitted a proposal for this gig' });
    }

    const proposal = await Proposal.create({
      gig: gigId,
      freelancer: req.user.id,
      coverLetter,
      bidAmount,
      estimatedDays,
      milestones: milestones || [],
      attachments: attachments || [],
      status: 'pending'
    });

    // Increment proposal count on Gig
    gig.proposals = (gig.proposals || 0) + 1;
    await gig.save();

    // Send notification email to client
    try {
      const client = gig.client;
      if (client && client.email) {
        const message = `Hello ${client.name},\n\nA freelancer has submitted a new proposal for your gig: "${gig.title}".\n\nBid Amount: ₹${bidAmount}\nDelivery Time: ${estimatedDays} days\n\nLog in to review the application and cover letter.`;
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #7C3AED;">New Proposal Received!</h2>
            <p>Hi ${client.name},</p>
            <p>You received a new bid for your gig <strong>"${gig.title}"</strong>:</p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>Bid:</strong> ₹${bidAmount}</p>
              <p style="margin: 5px 0;"><strong>Timeline:</strong> ${estimatedDays} Days</p>
              <p style="margin: 10px 0 0 0; font-style: italic; color: #475569; font-size: 14px;">"${coverLetter.substring(0, 150)}..."</p>
            </div>
            <div style="text-align: center; margin: 25px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/client/gigs/${gig._id}/proposals" style="background-color: #7C3AED; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Proposal</a>
            </div>
          </div>
        `;
        await sendEmail({
          email: client.email,
          subject: `SkillSphere - New Proposal for: ${gig.title}`,
          message,
          html
        }).catch(err => console.error('Error sending client proposal notification:', err.message));
      }
    } catch (mailErr) {
      console.error('Mail notification failed:', mailErr.message);
    }

    res.status(201).json({ success: true, proposal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all proposals for a specific gig
// @route   GET /api/proposals/gig/:gigId
// @access  Private (Client owner of gig only)
exports.getGigProposals = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.gigId);
    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    // Verify ownership
    if (gig.client.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to view proposals for this gig' });
    }

    const proposals = await Proposal.find({ gig: req.params.gigId })
      .populate('freelancer', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, proposals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get freelancer's own proposals
// @route   GET /api/proposals/my-proposals
// @access  Private (Freelancer only)
exports.getMyProposals = async (req, res, next) => {
  try {
    const proposals = await Proposal.find({ freelancer: req.user.id })
      .populate({
        path: 'gig',
        select: 'title category budgetType budgetMin budgetMax status'
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: proposals.length, proposals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single proposal
// @route   GET /api/proposals/:id
// @access  Private
exports.getProposal = async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate('freelancer', 'name email avatar')
      .populate({
        path: 'gig',
        select: 'title description client budgetType budgetMin budgetMax status milestones'
      });

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    // Check authorization: client owner, freelancer bidder or admin
    const isClientOwner = proposal.gig.client.toString() === req.user.id;
    const isFreelancerBidder = proposal.freelancer._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isClientOwner && !isFreelancerBidder && !isAdmin) {
      return res.status(401).json({ success: false, message: 'Not authorized to view this proposal' });
    }

    res.status(200).json({ success: true, proposal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Accept a proposal
// @route   PUT /api/proposals/:id/accept
// @access  Private (Client owner of gig only)
exports.acceptProposal = async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id).populate('gig freelancer');
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    // Verify ownership of the gig
    if (proposal.gig.client.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to accept this proposal' });
    }

    if (proposal.gig.status !== 'open') {
      return res.status(400).json({ success: false, message: 'Gig is no longer open for bids' });
    }

    // Update current proposal status
    proposal.status = 'accepted';
    await proposal.save();

    // Update Gig status to in-progress
    const gig = await Gig.findById(proposal.gig._id);
    gig.status = 'in-progress';
    // Optionally setup gig milestones based on proposal milestones
    if (proposal.milestones && proposal.milestones.length > 0) {
      gig.milestones = proposal.milestones.map(m => ({
        title: m.title,
        amount: m.amount,
        status: 'pending'
      }));
    }
    await gig.save();

    // Auto-reject other proposals
    await Proposal.updateMany(
      { gig: gig._id, _id: { $ne: proposal._id }, status: 'pending' },
      { $set: { status: 'rejected', clientResponse: 'Another proposal was accepted for this gig.' } }
    );

    // Notify accepted freelancer
    try {
      const freelancer = proposal.freelancer;
      if (freelancer && freelancer.email) {
        const message = `Congratulations ${freelancer.name}!\n\nYour proposal for the gig "${gig.title}" has been accepted by the client. The gig is now active and in-progress.\n\nLog in to communicate and start working.`;
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #10B981;">Proposal Accepted!</h2>
            <p>Hi ${freelancer.name},</p>
            <p>Awesome news! Your proposal for the gig <strong>"${gig.title}"</strong> has been accepted by the client.</p>
            <div style="background-color: #f0fdf4; padding: 15px; border-radius: 6px; margin: 15px 0; border: 1px solid #bbf7d0;">
              <p style="margin: 0; color: #15803d; font-weight: bold;">Contract Amount: ₹${proposal.bidAmount}</p>
              <p style="margin: 5px 0 0 0; color: #166534;">Estimated Timeline: ${proposal.estimatedDays} days</p>
            </div>
            <div style="text-align: center; margin: 25px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/freelancer/my-proposals" style="background-color: #10B981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Contract Details</a>
            </div>
          </div>
        `;
        await sendEmail({
          email: freelancer.email,
          subject: `SkillSphere - Proposal Accepted: ${gig.title}`,
          message,
          html
        });
      }
    } catch (mailErr) {
      console.error('Notification to accepted freelancer failed:', mailErr.message);
    }

    res.status(200).json({ success: true, message: 'Proposal accepted and project started successfully', proposal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject a proposal
// @route   PUT /api/proposals/:id/reject
// @access  Private (Client owner of gig only)
exports.rejectProposal = async (req, res, next) => {
  try {
    const { clientResponse } = req.body;
    const proposal = await Proposal.findById(req.params.id).populate('gig freelancer');
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    // Verify ownership of the gig
    if (proposal.gig.client.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to reject this proposal' });
    }

    proposal.status = 'rejected';
    proposal.clientResponse = clientResponse || 'Thank you for your proposal. We decided to move forward with another candidate.';
    await proposal.save();

    // Send notification
    try {
      const freelancer = proposal.freelancer;
      if (freelancer && freelancer.email) {
        await sendEmail({
          email: freelancer.email,
          subject: `SkillSphere - Proposal Update for: ${proposal.gig.title}`,
          message: `Hello ${freelancer.name},\n\nYour proposal for the gig "${proposal.gig.title}" has been updated. The client left the following feedback:\n\n"${proposal.clientResponse}"`
        });
      }
    } catch (err) {
      console.error(err.message);
    }

    res.status(200).json({ success: true, message: 'Proposal rejected successfully', proposal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Negotiate proposal details (rate/comments)
// @route   PUT /api/proposals/:id/negotiate
// @access  Private (Client owner or Freelancer bidder)
exports.negotiateProposal = async (req, res, next) => {
  try {
    const { amount, message } = req.body;

    if (!amount || !message) {
      return res.status(400).json({ success: false, message: 'Please provide amount and message' });
    }

    const proposal = await Proposal.findById(req.params.id).populate('gig freelancer');
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    const isClient = proposal.gig.client.toString() === req.user.id;
    const isFreelancer = proposal.freelancer._id.toString() === req.user.id;

    if (!isClient && !isFreelancer) {
      return res.status(401).json({ success: false, message: 'Not authorized to negotiate on this proposal' });
    }

    const senderRole = isClient ? 'client' : 'freelancer';

    // Append to negotiation history
    proposal.negotiationHistory.push({
      amount,
      message,
      by: senderRole,
      date: new Date()
    });

    // Update proposal bid amount to latest negotiated value
    proposal.bidAmount = amount;
    await proposal.save();

    // Notify the other party
    try {
      const recipient = isClient ? proposal.freelancer : await User.findById(proposal.gig.client);
      if (recipient && recipient.email) {
        const notifyMsg = `Hello ${recipient.name},\n\nA new negotiation offer has been sent regarding the proposal for "${proposal.gig.title}".\n\nProposed Amount: ₹${amount}\nMessage: "${message}"`;
        await sendEmail({
          email: recipient.email,
          subject: `SkillSphere - Negotiation Proposal for: ${proposal.gig.title}`,
          message: notifyMsg
        });
      }
    } catch (err) {
      console.error(err.message);
    }

    res.status(200).json({ success: true, message: 'Negotiation proposal sent successfully', proposal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Withdraw a proposal
// @route   PUT /api/proposals/:id/withdraw
// @access  Private (Freelancer owner of proposal only)
exports.withdrawProposal = async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id).populate('gig');
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    // Verify ownership
    if (proposal.freelancer.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to withdraw this proposal' });
    }

    if (proposal.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Cannot withdraw a proposal that is already ${proposal.status}` });
    }

    proposal.status = 'withdrawn';
    await proposal.save();

    // Decrement proposals count on Gig
    const gig = await Gig.findById(proposal.gig._id);
    if (gig && gig.proposals > 0) {
      gig.proposals -= 1;
      await gig.save();
    }

    res.status(200).json({ success: true, message: 'Proposal withdrawn successfully', proposal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
