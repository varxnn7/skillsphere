const Review = require('../models/Review');
const Gig = require('../models/Gig');
const FreelancerProfile = require('../models/FreelancerProfile');
const ClientProfile = require('../models/ClientProfile');
const Notification = require('../models/Notification');

// @desc    Submit a review
// @route   POST /api/reviews
// @access  Private
exports.submitReview = async (req, res, next) => {
  try {
    const { gigId, revieweeId, rating, comment, tags } = req.body;

    if (!gigId || !revieweeId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // 1. Verify gig is completed
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    if (gig.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Reviews are only allowed after the gig is completed' });
    }

    // 2. Check permissions (reviewer must be part of gig: client or freelancer)
    const isClient = gig.client.toString() === req.user.id;
    // Find accepted proposal to get freelancer ID
    const Proposal = require('../models/Proposal');
    const acceptedProposal = await Proposal.findOne({ gig: gigId, status: 'accepted' });
    if (!acceptedProposal) {
      return res.status(400).json({ success: false, message: 'No freelancer was contracted for this gig' });
    }
    const isFreelancer = acceptedProposal.freelancer.toString() === req.user.id;

    if (!isClient && !isFreelancer) {
      return res.status(403).json({ success: false, message: 'You are not authorized to review this gig' });
    }

    // Determine role
    let role = '';
    if (isClient) {
      role = 'client-to-freelancer';
      if (revieweeId !== acceptedProposal.freelancer.toString()) {
        return res.status(400).json({ success: false, message: 'Invalid reviewee' });
      }
    } else {
      role = 'freelancer-to-client';
      if (revieweeId !== gig.client.toString()) {
        return res.status(400).json({ success: false, message: 'Invalid reviewee' });
      }
    }

    // 3. Prevent duplicate reviews
    const existingReview = await Review.findOne({ gig: gigId, reviewer: req.user.id });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already submitted a review for this gig' });
    }

    // 4. Create review
    const review = await Review.create({
      gig: gigId,
      reviewer: req.user.id,
      reviewee: revieweeId,
      role,
      rating,
      comment,
      tags
    });

    // 5. Update profiles averageRating
    if (role === 'client-to-freelancer') {
      const allReviews = await Review.find({ reviewee: revieweeId, role: 'client-to-freelancer' });
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      const formattedAvg = Number(avg.toFixed(1));
      
      await FreelancerProfile.findOneAndUpdate(
        { user: revieweeId },
        { averageRating: formattedAvg, totalReviews: allReviews.length },
        { upsert: true }
      );
      await User.findByIdAndUpdate(revieweeId, { averageRating: formattedAvg });
    } else {
      const allReviews = await Review.find({ reviewee: revieweeId, role: 'freelancer-to-client' });
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      const formattedAvg = Number(avg.toFixed(1));

      await ClientProfile.findOneAndUpdate(
        { user: revieweeId },
        { averageRating: formattedAvg },
        { upsert: true }
      );
      await User.findByIdAndUpdate(revieweeId, { averageRating: formattedAvg });
    }

    // 6. Notify reviewee
    const notification = await Notification.create({
      user: revieweeId,
      type: 'review_added',
      title: 'New Review Received',
      message: `${req.user.name} left you a ${rating}-star review for the gig "${gig.title}".`,
      link: role === 'client-to-freelancer' ? `/freelancer/${revieweeId}/reviews` : '/client/profile'
    });

    const sendRealTimeNotification = req.app.get('sendRealTimeNotification');
    if (sendRealTimeNotification) {
      sendRealTimeNotification(revieweeId, notification);
    }

    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reviews for a freelancer
// @route   GET /api/reviews/freelancer/:id
// @access  Public
exports.getFreelancerReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.id, role: 'client-to-freelancer' })
      .populate('reviewer', 'name avatar')
      .populate('gig', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reviews for a client
// @route   GET /api/reviews/client/:id
// @access  Public
exports.getClientReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.id, role: 'freelancer-to-client' })
      .populate('reviewer', 'name avatar')
      .populate('gig', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get reviews for a specific gig
// @route   GET /api/reviews/gig/:id
// @access  Public
exports.getGigReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ gig: req.params.id })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reviewee adds response to review
// @route   PUT /api/reviews/:id/response
// @access  Private
exports.respondToReview = async (req, res, next) => {
  try {
    const { response } = req.body;
    if (!response) {
      return res.status(400).json({ success: false, message: 'Response comment is required' });
    }

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Verify current user is the reviewee
    if (review.reviewee.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You are not authorized to respond to this review' });
    }

    review.response = response;
    await review.save();

    res.status(200).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark review as helpful
// @route   PUT /api/reviews/:id/helpful
// @access  Private
exports.markHelpful = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.status(200).json({ success: true, helpfulCount: review.helpfulCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Flag suspicious review
// @route   PUT /api/reviews/:id/flag
// @access  Private/Admin
exports.flagReview = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isFlagged: true },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.status(200).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
