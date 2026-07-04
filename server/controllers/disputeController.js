const Dispute = require('../models/Dispute');
const Payment = require('../models/Payment');
const Gig = require('../models/Gig');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { handleFileUpload } = require('../middleware/upload');

// @desc    Raise a new dispute
// @route   POST /api/disputes
// @access  Private (Client / Freelancer)
exports.raiseDispute = async (req, res, next) => {
  try {
    const { paymentId, reason, description } = req.body;

    if (!paymentId || !reason || !description) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    // A dispute can only be raised on payments currently in 'escrow' status
    if (payment.status !== 'escrow') {
      return res.status(400).json({ success: false, message: 'Disputes can only be raised on active escrow payments' });
    }

    // Determine roles
    const raisedBy = req.user.id;
    let against;
    if (payment.client.toString() === raisedBy) {
      against = payment.freelancer;
    } else if (payment.freelancer.toString() === raisedBy) {
      against = payment.client;
    } else {
      return res.status(403).json({ success: false, message: 'You are not a participant in this payment contract' });
    }

    // Process files if upload happened
    let evidence = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        evidence.push({
          url: file.path || 'https://res.cloudinary.com/demo/image/upload/v1580579040/sample.jpg',
          name: file.originalname || 'evidence_file',
          type: file.mimetype ? (file.mimetype.startsWith('image/') ? 'image' : 'file') : 'file'
        });
      }
    } else if (req.file) {
      evidence.push({
        url: req.file.path || 'https://res.cloudinary.com/demo/image/upload/v1580579040/sample.jpg',
        name: req.file.originalname || 'evidence_file',
        type: req.file.mimetype ? (req.file.mimetype.startsWith('image/') ? 'image' : 'file') : 'file'
      });
    }

    const dispute = await Dispute.create({
      gig: payment.gig,
      payment: paymentId,
      raisedBy,
      against,
      reason,
      description,
      evidence,
      status: 'open'
    });

    // Mark payment status to disputed
    payment.status = 'disputed';
    await payment.save();

    // Find admin user to notify
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
      await Notification.create({
        user: adminUser._id,
        type: 'dispute_filed',
        title: 'New Dispute Filed',
        message: `A dispute has been raised by ${req.user.name} for gig milestone.`,
        link: `/admin/disputes`
      });
    }

    // Notify opposing party
    await Notification.create({
      user: against,
      type: 'dispute_filed',
      title: 'Dispute Raised Against You',
      message: `A dispute has been raised regarding Milestone #${payment.milestoneIndex + 1} funding.`,
      link: `/dispute/${dispute._id}`
    });

    res.status(201).json({ success: true, message: 'Dispute raised successfully', dispute });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get own disputes
// @route   GET /api/disputes
// @access  Private
exports.getOwnDisputes = async (req, res, next) => {
  try {
    const disputes = await Dispute.find({ raisedBy: req.user.id })
      .populate('against', 'name email avatar')
      .populate('gig', 'title')
      .populate('payment')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, count: disputes.length, disputes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all disputes (Admin only)
// @route   GET /api/disputes/admin/all
// @access  Private (Admin)
exports.getAdminDisputes = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Dispute.countDocuments(query);

    // Sort: oldest first (urgent disputes first) -> createdAt: 1
    const disputes = await Dispute.find(query)
      .populate('raisedBy', 'name email')
      .populate('against', 'name email')
      .populate('gig', 'title')
      .populate('payment')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.status(200).json({
      success: true,
      count: disputes.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        totalResults: total
      },
      disputes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dispute detail
// @route   GET /api/disputes/:id
// @access  Private
exports.getDisputeDetail = async (req, res, next) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate('raisedBy', 'name email role avatar')
      .populate('against', 'name email role avatar')
      .populate('gig', 'title description location skills budgetType client freelancer milestones')
      .populate('payment');

    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found' });
    }

    // Check authorization: User must be reporter, target, or admin
    if (
      req.user.role !== 'admin' &&
      dispute.raisedBy._id.toString() !== req.user.id &&
      dispute.against._id.toString() !== req.user.id
    ) {
      return res.status(401).json({ success: false, message: 'Not authorized to view this dispute file' });
    }

    res.status(200).json({ success: true, dispute });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add more evidence to dispute
// @route   PUT /api/disputes/:id/evidence
// @access  Private
exports.addEvidence = async (req, res, next) => {
  try {
    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found' });
    }

    // Only raisedBy user can add evidence
    if (dispute.raisedBy.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to submit evidence. Only the raiser can add evidence.' });
    }

    if (dispute.status === 'closed' || dispute.status.startsWith('resolved')) {
      return res.status(400).json({ success: false, message: 'Dispute is already resolved and closed' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an evidence file' });
    }

    const url = await handleFileUpload(req);
    dispute.evidence.push({
      url,
      name: req.file.originalname,
      type: req.file.mimetype.startsWith('image/') ? 'image' : 'file'
    });

    await dispute.save();
    res.status(200).json({ success: true, message: 'Evidence added successfully', dispute });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin resolves dispute (release or refund)
// @route   PUT /api/disputes/:id/resolve
// @access  Private (Admin)
exports.resolveDispute = async (req, res, next) => {
  try {
    const { winner, adminNotes, resolution } = req.body;

    if (!winner || !resolution) {
      return res.status(400).json({ success: false, message: 'Please provide the resolution winner and details' });
    }

    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) {
      return res.status(404).json({ success: false, message: 'Dispute not found' });
    }

    const payment = await Payment.findById(dispute.payment);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    dispute.adminNotes = adminNotes || '';
    dispute.resolution = resolution;
    dispute.resolvedBy = req.user.id;
    dispute.resolvedAt = Date.now();

    if (winner === 'client') {
      // Refund to Client
      dispute.status = 'resolved-client';
      
      payment.status = 'refunded';
      payment.refundedAt = Date.now();
      await payment.save();

      // Reset Gig milestone status
      const gig = await Gig.findById(payment.gig);
      if (gig) {
        if (payment.type === 'milestone' && payment.milestoneIndex !== null) {
          const milestone = gig.milestones[payment.milestoneIndex];
          if (milestone) {
            milestone.status = 'cancelled';
          }
        }
        await gig.save();
      }

      // Notify parties
      await Notification.create({
        user: payment.client,
        type: 'dispute_resolved',
        title: 'Dispute Resolved in Your Favor',
        message: `Admin resolved dispute in your favor. Refund of ₹${payment.amount.toLocaleString()} has been initiated.`,
        link: `/dispute/${dispute._id}`
      });

      await Notification.create({
        user: payment.freelancer,
        type: 'dispute_resolved',
        title: 'Dispute Resolved against you',
        message: `Admin resolved dispute in favor of the client. Payment has been refunded.`,
        link: `/dispute/${dispute._id}`
      });

    } else if (winner === 'freelancer') {
      // Release to Freelancer
      dispute.status = 'resolved-freelancer';

      payment.status = 'released';
      payment.releasedAt = Date.now();
      await payment.save();

      // Update Gig milestone status to approved
      const gig = await Gig.findById(payment.gig);
      if (gig) {
        if (payment.type === 'milestone' && payment.milestoneIndex !== null) {
          const milestone = gig.milestones[payment.milestoneIndex];
          if (milestone) {
            milestone.status = 'approved';
          }
        }
        // Check if all milestones are approved or released, mark gig completed
        const allReleased = gig.milestones.every(m => m.status === 'approved' || m.status === 'released' || m.status === 'cancelled');
        if (allReleased) {
          gig.status = 'completed';
        }
        await gig.save();
      }

      // Notify parties
      await Notification.create({
        user: payment.freelancer,
        type: 'dispute_resolved',
        title: 'Dispute Resolved in Your Favor',
        message: `Admin resolved dispute in your favor. Funds of ₹${payment.freelancerAmount.toLocaleString()} released to your account.`,
        link: `/dispute/${dispute._id}`
      });

      await Notification.create({
        user: payment.client,
        type: 'dispute_resolved',
        title: 'Dispute Resolved against you',
        message: `Admin resolved dispute in favor of the freelancer. Funds have been released.`,
        link: `/dispute/${dispute._id}`
      });

    } else {
      return res.status(400).json({ success: false, message: 'Invalid winner selection' });
    }

    await dispute.save();
    res.status(200).json({ success: true, message: 'Dispute resolved successfully', dispute });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
