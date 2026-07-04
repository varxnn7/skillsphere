const mongoose = require('mongoose');

const DisputeSchema = new mongoose.Schema(
  {
    gig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
      required: true
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      required: true
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    against: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      required: [true, 'Please add a reason for the dispute']
    },
    description: {
      type: String,
      required: [true, 'Please add a description of the dispute'],
      maxlength: [3000, 'Description cannot exceed 3000 characters']
    },
    evidence: [
      {
        url: { type: String, required: true },
        name: { type: String, required: true },
        type: { type: String, default: 'file' }
      }
    ],
    status: {
      type: String,
      enum: ['open', 'under-review', 'resolved-client', 'resolved-freelancer', 'closed'],
      default: 'open'
    },
    adminNotes: {
      type: String,
      default: ''
    },
    resolution: {
      type: String,
      default: ''
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Indexes for performance optimization
DisputeSchema.index({ raisedBy: 1 });
DisputeSchema.index({ status: 1 });
DisputeSchema.index({ payment: 1 });

module.exports = mongoose.model('Dispute', DisputeSchema);

