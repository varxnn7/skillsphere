const FreelancerProfile = require('../models/FreelancerProfile');
const ClientProfile = require('../models/ClientProfile');
const User = require('../models/User');
const { handleFileUpload } = require('../middleware/upload');

// @desc    Get freelancer profile by User ID
// @route   GET /api/profile/freelancer/:id
// @access  Public
exports.getFreelancerProfile = async (req, res, next) => {
  try {
    const profile = await FreelancerProfile.findOne({ user: req.params.id }).populate('user', 'name email role avatar');
    
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Freelancer profile not found' });
    }

    // Increment views if viewer is a client
    if (req.user && req.user.role === 'client') {
      profile.views = (profile.views || 0) + 1;
      await profile.save();
    }

    res.status(200).json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update own freelancer profile
// @route   PUT /api/profile/freelancer
// @access  Private/Freelancer
exports.updateFreelancerProfile = async (req, res, next) => {
  try {
    const { title, bio, skills, hourlyRate, location, availabilityStatus, certifications, workExperience } = req.body;

    let profile = await FreelancerProfile.findOne({ user: req.user.id });

    if (!profile) {
      profile = new FreelancerProfile({ user: req.user.id });
    }

    // Update fields
    if (title !== undefined) profile.title = title;
    if (bio !== undefined) profile.bio = bio;
    if (skills !== undefined) profile.skills = skills; // Expects array of {name, level}
    if (hourlyRate !== undefined) profile.hourlyRate = hourlyRate;
    if (location !== undefined) profile.location = location;
    if (availabilityStatus !== undefined) profile.availabilityStatus = availabilityStatus;
    if (certifications !== undefined) profile.certifications = certifications;
    if (workExperience !== undefined) profile.workExperience = workExperience;

    await profile.save();

    // Populate user details for returning
    await profile.populate('user', 'name email role avatar');

    res.status(200).json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add item to freelancer portfolio
// @route   POST /api/profile/freelancer/portfolio
// @access  Private/Freelancer
exports.addPortfolioItem = async (req, res, next) => {
  try {
    const { title, description, link } = req.body;
    let imageUrl = '';

    // Handle image upload if a file is uploaded
    if (req.file) {
      imageUrl = await handleFileUpload(req);
    }

    const profile = await FreelancerProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Freelancer profile not found' });
    }

    profile.portfolio.push({
      title,
      description,
      image: imageUrl,
      link
    });

    await profile.save();
    res.status(200).json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload freelancer resume
// @route   POST /api/profile/freelancer/upload-resume
// @access  Private/Freelancer
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a resume file' });
    }

    const resumeUrl = await handleFileUpload(req);

    const profile = await FreelancerProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Freelancer profile not found' });
    }

    profile.resume = resumeUrl;
    await profile.save();

    res.status(200).json({ success: true, resumeUrl, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get client profile by User ID
// @route   GET /api/profile/client/:id
// @access  Public
exports.getClientProfile = async (req, res, next) => {
  try {
    const profile = await ClientProfile.findOne({ user: req.params.id }).populate('user', 'name email role avatar');

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Client profile not found' });
    }

    res.status(200).json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update own client profile
// @route   PUT /api/profile/client
// @access  Private/Client
exports.updateClientProfile = async (req, res, next) => {
  try {
    const { companyName, bio, location } = req.body;

    let profile = await ClientProfile.findOne({ user: req.user.id });

    if (!profile) {
      profile = new ClientProfile({ user: req.user.id });
    }

    if (companyName !== undefined) profile.companyName = companyName;
    if (bio !== undefined) profile.bio = bio;
    if (location !== undefined) profile.location = location;

    await profile.save();
    await profile.populate('user', 'name email role avatar');

    res.status(200).json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload user avatar
// @route   POST /api/profile/upload-avatar
// @access  Private
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    const avatarUrl = await handleFileUpload(req);

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.avatar = avatarUrl;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatar: avatarUrl,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
