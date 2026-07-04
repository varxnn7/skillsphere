const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    gig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
      required: true
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    proposal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proposal',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    platformFee: {
      type: Number,
      required: true
    },
    freelancerAmount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    status: {
      type: String,
      enum: ['pending', 'escrow', 'released', 'refunded', 'disputed'],
      default: 'pending'
    },
    razorpayOrderId: {
      type: String
    },
    razorpayPaymentId: {
      type: String
    },
    razorpaySignature: {
      type: String
    },
    milestoneIndex: {
      type: Number
    },
    type: {
      type: String,
      enum: ['full', 'milestone'],
      default: 'full'
    },
    paidAt: {
      type: Date
    },
    releasedAt: {
      type: Date
    },
    refundedAt: {
      type: Date
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Indexes for performance optimization
PaymentSchema.index({ client: 1 });
PaymentSchema.index({ freelancer: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ gig: 1 });

module.exports = mongoose.model('Payment', PaymentSchema);

