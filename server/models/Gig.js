const mongoose = require('mongoose');

const GigSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a gig title'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please add a gig description'],
      maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: String,
      required: [true, 'Please select a category']
    },
    subCategory: {
      type: String
    },
    skills: {
      type: [String],
      required: [true, 'Please add required skills']
    },
    budgetType: {
      type: String,
      enum: ['fixed', 'hourly'],
      default: 'fixed'
    },
    budgetMin: {
      type: Number,
      required: [true, 'Please add a minimum budget']
    },
    budgetMax: {
      type: Number,
      required: [true, 'Please add a maximum budget']
    },
    duration: {
      type: String,
      required: [true, 'Please add estimated duration']
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'intermediate', 'expert'],
      default: 'intermediate'
    },
    location: {
      type: String,
      default: ''
    },
    isRemote: {
      type: Boolean,
      default: true
    },
    attachments: [
      {
        url: { type: String, required: true },
        name: { type: String, required: true }
      }
    ],
    status: {
      type: String,
      enum: ['open', 'in-progress', 'completed', 'cancelled'],
      default: 'open'
    },
    milestones: [
      {
        title: { type: String, required: true },
        description: { type: String },
        amount: { type: Number, required: true },
        dueDate: { type: Date },
        status: {
          type: String,
          enum: ['pending', 'funded', 'in-progress', 'submitted', 'approved', 'released', 'cancelled'],
          default: 'pending'
        }
      }
    ],
    proposals: {
      type: Number,
      default: 0
    },
    isApproved: {
      type: Boolean,
      default: true
    },
    views: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Indexes for performance
GigSchema.index({ skills: 1 });
GigSchema.index({ status: 1 });
GigSchema.index({ location: 1 });
GigSchema.index({ client: 1 });
GigSchema.index({ isApproved: 1, status: 1 });

module.exports = mongoose.model('Gig', GigSchema);
