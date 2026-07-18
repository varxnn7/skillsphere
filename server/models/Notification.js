const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: [
        'new_proposal',
        'proposal_accepted',
        'proposal_rejected',
        'new_message',
        'payment_received',
        'payment_released',
        'payment_refunded',
        'gig_posted',
        'gig_approved',
        'gig_rejected',
        'review_added',
        'dispute_opened',
        'dispute_filed',
        'dispute_resolved',
        'account_verified',
        'account_suspended',
        'account_activated',
        'profile_verified',
        'milestone_submitted',
        'milestone_revision'
      ],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    link: {
      type: String,
      default: ''
    },
    isRead: {
      type: Boolean,
      default: false
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Indexes for performance
NotificationSchema.index({ user: 1, isRead: 1 });
NotificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
