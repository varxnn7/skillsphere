const crypto = require('crypto');
const Razorpay = require('razorpay');
const Payment = require('../models/Payment');
const Gig = require('../models/Gig');
const Proposal = require('../models/Proposal');
const User = require('../models/User');
const Notification = require('../models/Notification');

const isRazorpayConfigured =
  process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_ID !== 'pending_setup' &&
  process.env.RAZORPAY_KEY_SECRET &&
  process.env.RAZORPAY_KEY_SECRET !== 'pending_setup';

let razorpay = null;
if (isRazorpayConfigured) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

// @desc    Create Razorpay order or mock order & save pending payment
// @route   POST /api/payments/create-order
// @access  Private (Client)
exports.createOrder = async (req, res, next) => {
  try {
    const { gigId, proposalId, milestoneIndex } = req.body;

    if (!gigId || !proposalId) {
      return res.status(400).json({ success: false, message: 'Please provide gigId and proposalId' });
    }

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    // Verify ownership of the gig
    if (gig.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You do not own this gig' });
    }

    const proposal = await Proposal.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    if (proposal.status !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Proposal is not accepted' });
    }

    // Determine type and amount
    let amount = 0;
    let type = 'full';
    const mIndex = milestoneIndex !== undefined && milestoneIndex !== null ? Number(milestoneIndex) : null;

    if (mIndex !== null && !isNaN(mIndex)) {
      if (gig.milestones && gig.milestones.length > 0) {
        if (gig.milestones[mIndex]) {
          amount = gig.milestones[mIndex].amount;
          type = 'milestone';
        } else {
          return res.status(404).json({ success: false, message: 'Specified milestone index not found on gig' });
        }
      } else {
        // Fallback to full payment if gig has no milestones array in DB
        amount = proposal.bidAmount;
        type = 'full';
      }
    } else {
      amount = proposal.bidAmount;
      type = 'full';
    }

    // Exact platform fee calculation: 10% platform fee, 90% freelancer earnings
    const platformFee = amount * 0.10;
    const freelancerAmount = amount * 0.90;

    // Check if we need to run in mock payment mode
    if (!isRazorpayConfigured) {
      const mockOrderId = 'mock_order_' + Date.now();
      const payment = await Payment.create({
        gig: gigId,
        client: req.user.id,
        freelancer: proposal.freelancer,
        proposal: proposalId,
        amount,
        platformFee,
        freelancerAmount,
        currency: 'INR',
        status: 'pending',
        razorpayOrderId: mockOrderId,
        milestoneIndex: mIndex,
        type
      });

      return res.status(201).json({
        success: true,
        order: {
          id: mockOrderId,
          amount: amount * 100,
          currency: 'INR',
          isMock: true
        },
        payment
      });
    }

    // Create real order via Razorpay
    const options = {
      amount: Math.round(amount * 100), // in Paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    };

    const order = await razorpay.orders.create(options);

    // Save pending payment record in database
    const payment = await Payment.create({
      gig: gigId,
      client: req.user.id,
      freelancer: proposal.freelancer,
      proposal: proposalId,
      amount,
      platformFee,
      freelancerAmount,
      currency: 'INR',
      status: 'pending',
      razorpayOrderId: order.id,
      milestoneIndex: mIndex,
      type
    });

    res.status(201).json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        isMock: false
      },
      paymentId: payment._id,
      payment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Razorpay payment signature & update to Escrow
// @route   POST /api/payments/verify
// @access  Private (Client)
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentId } = req.body;

    if (!razorpayOrderId) {
      return res.status(400).json({ success: false, message: 'Missing razorpayOrderId' });
    }

    let payment;
    if (paymentId) {
      payment = await Payment.findById(paymentId).populate('gig', 'title');
    } else {
      payment = await Payment.findOne({ razorpayOrderId }).populate('gig', 'title');
    }

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    const gigTitle = payment.gig?.title || 'your project';
    const amountStr = `₹${payment.freelancerAmount?.toLocaleString('en-IN')}`;
    const sendNotification = req.app.get('sendRealTimeNotification');

    const markEscrowAndNotify = async () => {
      // Update Gig milestone status to 'funded'
      const gig = await Gig.findById(payment.gig?._id || payment.gig);
      if (gig) {
        if (gig.status === 'open') gig.status = 'in-progress';
        if (payment.type === 'milestone' && payment.milestoneIndex !== null && gig.milestones?.length > 0) {
          const milestone = gig.milestones[payment.milestoneIndex];
          if (milestone) milestone.status = 'funded';
        }
        await gig.save();
      }

      // Notify Freelancer (DB + Socket)
      const freelancerNotif = await Notification.create({
        user: payment.freelancer,
        type: 'payment_received',
        title: '💰 Payment in Escrow',
        message: `${amountStr} for "${gigTitle}" is now secured in escrow. Start working!`,
        link: `/freelancer/earnings`
      });
      if (sendNotification) {
        await sendNotification(payment.freelancer.toString(), freelancerNotif);
      }
    };

    // 1. Check if mock payment
    if (razorpayOrderId.startsWith('mock_order_')) {
      payment.status = 'escrow';
      payment.razorpayPaymentId = razorpayPaymentId || 'mock_pay_id_' + Date.now();
      payment.razorpaySignature = razorpaySignature || 'mock_sig_id_' + Date.now();
      payment.paidAt = Date.now();
      await payment.save();
      await markEscrowAndNotify();
      return res.status(200).json({ success: true, message: 'Payment verified and secured in escrow (Mock)', payment });
    }

    // 2. Real signature verification
    if (!razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Missing signature verification tokens' });
    }

    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    payment.status = 'escrow';
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.paidAt = Date.now();
    await payment.save();
    await markEscrowAndNotify();

    res.status(200).json({ success: true, message: 'Payment verified and secured in escrow', payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Client releases payment from Escrow to Freelancer
// @route   POST /api/payments/release/:paymentId
// @access  Private (Client)
exports.releasePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.paymentId).populate('gig', 'title');
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (payment.client.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to release this escrow' });
    }

    if (payment.status !== 'escrow' && payment.status !== 'disputed') {
      return res.status(400).json({ success: false, message: 'Payment is not in escrow' });
    }

    payment.status = 'released';
    payment.releasedAt = Date.now();
    await payment.save();

    const gigTitle = payment.gig?.title || 'your project';
    const sendNotification = req.app.get('sendRealTimeNotification');

    // Update Gig milestone status to 'approved'
    const gig = await Gig.findById(payment.gig?._id || payment.gig);
    if (gig) {
      if (payment.type === 'milestone' && payment.milestoneIndex !== null && gig.milestones?.length > 0) {
        const milestone = gig.milestones[payment.milestoneIndex];
        if (milestone) milestone.status = 'approved';
      }

      // If all milestones are approved/released/cancelled, mark gig as completed
      const allPaymentsForGig = await Payment.find({ gig: gig._id, status: { $in: ['released', 'refunded'] } });
      const totalPayments = await Payment.countDocuments({ gig: gig._id, status: { $nin: ['pending'] } });
      const escrowStillOpen = await Payment.countDocuments({ gig: gig._id, status: 'escrow' });

      if (escrowStillOpen === 0 && gig.milestones?.length > 0) {
        const allDone = gig.milestones.every(m => m.status === 'approved' || m.status === 'released' || m.status === 'cancelled');
        if (allDone) gig.status = 'completed';
      } else if (payment.type === 'full' && escrowStillOpen === 0) {
        gig.status = 'completed';
      }
      await gig.save();

      // Increment freelancer completedGigs count if gig is now completed
      if (gig.status === 'completed') {
        const acceptedProposal = await Proposal.findOne({ gig: gig._id, status: 'accepted' });
        if (acceptedProposal) {
          await User.findByIdAndUpdate(acceptedProposal.freelancer, { $inc: { completedGigs: 1 } });
          const FreelancerProfile = require('../models/FreelancerProfile');
          await FreelancerProfile.findOneAndUpdate({ user: acceptedProposal.freelancer }, { $inc: { completedGigs: 1 } });
        }
        await User.findByIdAndUpdate(payment.client, { $inc: { totalSpent: payment.amount } });
        const ClientProfile = require('../models/ClientProfile');
        await ClientProfile.findOneAndUpdate({ user: payment.client }, { $inc: { totalSpent: payment.amount } });
      }
    }

    const freelancerAmountStr = `₹${payment.freelancerAmount?.toLocaleString('en-IN')}`;
    const freelancerName = (await User.findById(payment.freelancer).select('name'))?.name || 'Freelancer';

    // Notify Freelancer (DB + Socket)
    const freelancerNotif = await Notification.create({
      user: payment.freelancer,
      type: 'payment_released',
      title: '🎉 Payment Released!',
      message: `${freelancerAmountStr} has been released to you for "${gigTitle}".`,
      link: `/freelancer/earnings`
    });
    if (sendNotification) await sendNotification(payment.freelancer.toString(), freelancerNotif);

    // Notify Client (DB + Socket)
    const clientNotif = await Notification.create({
      user: payment.client,
      type: 'payment_released',
      title: '✅ Payment Released',
      message: `You released ${freelancerAmountStr} to ${freelancerName} for "${gigTitle}".`,
      link: `/client/payments`
    });
    if (sendNotification) await sendNotification(payment.client.toString(), clientNotif);

    res.status(200).json({ success: true, message: 'Payment released successfully to freelancer', payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin refunds payment back to Client
// @route   POST /api/payments/refund/:paymentId
// @access  Private (Admin only)
exports.refundPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.paymentId).populate('gig', 'title');
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (payment.status !== 'escrow' && payment.status !== 'disputed') {
      return res.status(400).json({ success: false, message: 'Only escrow or disputed payments can be refunded' });
    }

    // If real keys are configured and it is not mock, try Razorpay refund
    if (isRazorpayConfigured && !payment.razorpayOrderId.startsWith('mock_order_')) {
      try {
        await razorpay.payments.refund(payment.razorpayPaymentId, {
          amount: Math.round(payment.amount * 100)
        });
      } catch (refErr) {
        console.warn('Razorpay live refund failed:', refErr.message);
      }
    }

    payment.status = 'refunded';
    payment.refundedAt = Date.now();
    await payment.save();

    const gigTitle = payment.gig?.title || 'your project';
    const amountStr = `₹${payment.amount?.toLocaleString('en-IN')}`;
    const sendNotification = req.app.get('sendRealTimeNotification');

    // Reset Gig Milestone status
    const gig = await Gig.findById(payment.gig?._id || payment.gig);
    if (gig) {
      if (payment.type === 'milestone' && payment.milestoneIndex !== null && gig.milestones?.length > 0) {
        const milestone = gig.milestones[payment.milestoneIndex];
        if (milestone) milestone.status = 'cancelled';
      }
      await gig.save();
    }

    // Notify Client (DB + Socket)
    const clientNotif = await Notification.create({
      user: payment.client,
      type: 'payment_refunded',
      title: '💸 Refund Processed',
      message: `${amountStr} has been refunded to you for "${gigTitle}".`,
      link: `/client/payments`
    });
    if (sendNotification) await sendNotification(payment.client.toString(), clientNotif);

    // Notify Freelancer (DB + Socket)
    const freelancerNotif = await Notification.create({
      user: payment.freelancer,
      type: 'payment_refunded',
      title: '❌ Payment Refunded',
      message: `The payment for "${gigTitle}" was refunded to the client.`,
      link: `/freelancer/earnings`
    });
    if (sendNotification) await sendNotification(payment.freelancer.toString(), freelancerNotif);

    res.status(200).json({ success: true, message: 'Payment refunded successfully', payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get client payment history
// @route   GET /api/payments/my-payments
// @access  Private (Client)
exports.getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ client: req.user.id })
      .populate('freelancer', 'name email avatar')
      .populate('gig', 'title')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, count: payments.length, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get freelancer earnings
// @route   GET /api/payments/my-earnings
// @access  Private (Freelancer)
exports.getMyEarnings = async (req, res, next) => {
  try {
    const freelancerId = req.user.id;

    // Get released payments
    const released = await Payment.find({ freelancer: freelancerId, status: 'released' })
      .populate('client', 'name email avatar')
      .populate('gig', 'title')
      .sort({ releasedAt: -1 })
      .lean();

    // Get escrow payments
    const escrow = await Payment.find({ freelancer: freelancerId, status: 'escrow' })
      .populate('client', 'name email avatar')
      .populate('gig', 'title')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate lifetime earnings (sum of freelancerAmount where released)
    const totalEarnings = released.reduce((sum, p) => sum + p.freelancerAmount, 0);

    // Calculate pending (escrow) amount
    const pendingAmount = escrow.reduce((sum, p) => sum + p.freelancerAmount, 0);

    // Calculate earnings for the current month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const thisMonthEarnings = released
      .filter(p => p.releasedAt && new Date(p.releasedAt) >= startOfMonth)
      .reduce((sum, p) => sum + p.freelancerAmount, 0);

    res.status(200).json({
      success: true,
      released,
      escrow,
      totalEarnings,
      thisMonthEarnings,
      pendingAmount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payments for a specific gig
// @route   GET /api/payments/gig/:gigId
// @access  Private (Client / Freelancer of that gig)
exports.getGigPayments = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.gigId).lean();
    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    // Find accepted proposal to get freelancer ID
    const acceptedProposal = await Proposal.findOne({ gig: req.params.gigId, status: 'accepted' }).lean();
    const freelancerId = acceptedProposal ? acceptedProposal.freelancer.toString() : null;

    if (gig.client.toString() !== req.user.id && freelancerId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view payments for this gig' });
    }

    const payments = await Payment.find({ gig: req.params.gigId })
      .populate('client', 'name email avatar')
      .populate('freelancer', 'name email avatar')
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all platform payments (Admin only)
// @route   GET /api/payments/admin/all
// @access  Private (Admin)
exports.getAdminPayments = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10, search = '', startDate, endDate } = req.query;

    const query = {};
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // First fetch with population for search filtering
    let payments = await Payment.find(query)
      .populate('client', 'name email avatar')
      .populate('freelancer', 'name email avatar')
      .populate('gig', 'title category')
      .populate('proposal', 'bidAmount')
      .sort({ createdAt: -1 })
      .lean();

    // Apply search filter after population
    if (search) {
      const s = search.toLowerCase();
      payments = payments.filter(p =>
        p.gig?.title?.toLowerCase().includes(s) ||
        p.client?.name?.toLowerCase().includes(s) ||
        p.client?.email?.toLowerCase().includes(s) ||
        p.freelancer?.name?.toLowerCase().includes(s) ||
        p.freelancer?.email?.toLowerCase().includes(s)
      );
    }

    const total = payments.length;
    const paginated = payments.slice(skip, skip + limitNum);

    res.status(200).json({
      success: true,
      payments: paginated,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get admin payment analytics
// @route   GET /api/payments/admin/stats
// @access  Private (Admin)
exports.getAdminStats = async (req, res, next) => {
  try {
    const releasedPayments = await Payment.find({ status: 'released' }).lean();
    const escrowPayments = await Payment.find({ status: 'escrow' }).lean();
    const refundedPayments = await Payment.find({ status: 'refunded' }).lean();

    const totalRevenue = releasedPayments.reduce((sum, p) => sum + (p.platformFee || 0), 0);
    const pendingEscrow = escrowPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalRefunded = refundedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
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

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalTransactions,
        monthlyRevenue,
        pendingEscrow,
        totalRefunded
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get details of a single payment
// @route   GET /api/payments/:paymentId
// @access  Private (Client, Freelancer, Admin)
exports.getPaymentDetail = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.paymentId)
      .populate('client', 'name email avatar')
      .populate('freelancer', 'name email avatar')
      .populate('gig', 'title description')
      .lean();

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (
      req.user.role !== 'admin' &&
      payment.client._id.toString() !== req.user.id &&
      payment.freelancer._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this payment' });
    }

    res.status(200).json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

