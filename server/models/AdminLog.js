const mongoose = require('mongoose');

const AdminLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      required: true
    },
    targetType: {
      type: String,
      enum: ['User', 'Gig', 'Payment', 'Dispute'],
      required: true
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    details: {
      type: String
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

// Indexes
AdminLogSchema.index({ admin: 1 });
AdminLogSchema.index({ targetId: 1 });
AdminLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AdminLog', AdminLogSchema);
