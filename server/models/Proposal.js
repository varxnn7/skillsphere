const mongoose = require('mongoose');

const ProposalSchema = new mongoose.Schema(
  {
    gig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gig',
      required: true
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    coverLetter: {
      type: String,
      required: [true, 'Please add a cover letter']
    },
    bidAmount: {
      type: Number,
      required: [true, 'Please specify your bid amount']
    },
    estimatedDays: {
      type: Number,
      required: [true, 'Please specify estimated days to deliver']
    },
    milestones: [
      {
        title: { type: String, required: true },
        amount: { type: Number, required: true },
        days: { type: Number, required: true }
      }
    ],
    attachments: [
      {
        url: { type: String, required: true },
        name: { type: String, required: true }
      }
    ],
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending'
    },
    clientResponse: {
      type: String,
      default: ''
    },
    negotiationHistory: [
      {
        amount: { type: Number, required: true },
        message: { type: String },
        by: { type: String, enum: ['client', 'freelancer'], required: true },
        date: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Proposal', ProposalSchema);
