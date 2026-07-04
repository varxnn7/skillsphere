const mongoose = require('mongoose');

const FreelancerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    title: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      default: ''
    },
    skills: [
      {
        name: { type: String, required: true },
        level: { type: String, enum: ['Beginner', 'Intermediate', 'Expert'], default: 'Intermediate' }
      }
    ],
    portfolio: [
      {
        title: { type: String, required: true },
        description: { type: String },
        image: { type: String }, // Cloudinary URL
        link: { type: String }
      }
    ],
    resume: {
      type: String, // Cloudinary URL
      default: ''
    },
    certifications: [
      {
        name: { type: String, required: true },
        issuer: { type: String, required: true },
        year: { type: Number }
      }
    ],
    workExperience: [
      {
        company: { type: String, required: true },
        role: { type: String, required: true },
        from: { type: Date, required: true },
        to: { type: Date },
        description: { type: String }
      }
    ],
    hourlyRate: {
      type: Number,
      default: 0
    },
    availabilityStatus: {
      type: String,
      enum: ['Available', 'Busy', 'Unavailable'],
      default: 'Available'
    },
    location: {
      type: String,
      default: ''
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationBadge: {
      type: Boolean,
      default: false
    },
    averageRating: {
      type: Number,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    completedGigs: {
      type: Number,
      default: 0
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

module.exports = mongoose.model('FreelancerProfile', FreelancerProfileSchema);
