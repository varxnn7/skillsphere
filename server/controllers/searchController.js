const FreelancerProfile = require('../models/FreelancerProfile');
const Gig = require('../models/Gig');
const User = require('../models/User');

// @desc    Search freelancers
// @route   GET /api/search/freelancers
// @access  Public
exports.searchFreelancers = async (req, res, next) => {
  try {
    const {
      skills,
      location,
      minRate,
      maxRate,
      rating,
      isAvailable,
      sort,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    // Filter by skills
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      // Match if any profile skill matches the array
      query['skills.name'] = { $in: skillsArray.map(skill => new RegExp(`^${skill}$`, 'i')) };
    }

    // Filter by location
    if (location) {
      query.location = new RegExp(location.trim(), 'i');
    }

    // Filter by hourly rate
    if (minRate || maxRate) {
      query.hourlyRate = {};
      if (minRate) query.hourlyRate.$gte = Number(minRate);
      if (maxRate) query.hourlyRate.$lte = Number(maxRate);
    }

    // Filter by rating
    if (rating) {
      query.averageRating = { $gte: Number(rating) };
    }

    // Filter by availability
    if (isAvailable !== undefined) {
      query.availabilityStatus = isAvailable === 'true' ? 'Available' : { $ne: 'Available' };
    }

    // Sorting definition
    let sortBy = { averageRating: -1 };
    if (sort) {
      if (sort === 'rating') {
        sortBy = { averageRating: -1 };
      } else if (sort === 'rate') {
        sortBy = { hourlyRate: 1 }; // lowest rate first or highest? Let's do ascending for rate (cheap first)
      } else if (sort === 'reviews') {
        sortBy = { totalReviews: -1 };
      }
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await FreelancerProfile.countDocuments(query);
    const profiles = await FreelancerProfile.find(query)
      .populate('user', 'name email avatar role')
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum);

    // Filter profiles where the associated user exists
    const validProfiles = profiles.filter(p => p.user !== null);

    res.status(200).json({
      success: true,
      count: validProfiles.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        totalResults: total
      },
      freelancers: validProfiles
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Advanced gig search (wrapper over gigController getGigs)
// @route   GET /api/search/gigs
// @access  Public
exports.searchGigs = async (req, res, next) => {
  // Re-use or implement the exact same query parameters for consistency
  try {
    const {
      category,
      skills,
      budgetMin,
      budgetMax,
      location,
      isRemote,
      experienceLevel,
      search,
      sort,
      page = 1,
      limit = 10
    } = req.query;

    const query = { isApproved: true };

    if (category) {
      query.category = category;
    }

    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      query.skills = { $in: skillsArray.map(skill => new RegExp(`^${skill}$`, 'i')) };
    }

    if (budgetMin || budgetMax) {
      query.budgetMax = {};
      if (budgetMin) query.budgetMax.$gte = Number(budgetMin);
      if (budgetMax) query.budgetMin = { ...query.budgetMin, $lte: Number(budgetMax) };
    }

    if (location) {
      query.location = new RegExp(location.trim(), 'i');
    }

    if (isRemote !== undefined) {
      query.isRemote = isRemote === 'true';
    }

    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let sortBy = { createdAt: -1 };
    if (sort) {
      if (sort === 'newest') {
        sortBy = { createdAt: -1 };
      } else if (sort === 'budget') {
        sortBy = { budgetMax: -1 };
      } else if (sort === 'proposals') {
        sortBy = { proposals: -1 };
      }
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Gig.countDocuments(query);
    const gigs = await Gig.find(query)
      .populate('client', 'name avatar')
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: gigs.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        totalResults: total
      },
      gigs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get autocomplete suggestions for skills and categories
// @route   GET /api/search/suggestions
// @access  Public
exports.getSuggestions = async (req, res, next) => {
  try {
    // Fetch unique categories and skills from Gigs & FreelancerProfiles
    const dbCategories = await Gig.distinct('category');
    const dbSkills = await FreelancerProfile.distinct('skills.name');

    // Default suggestions list to guarantee rich autocomplete in development
    const defaultCategories = [
      'Web Development',
      'Mobile Apps',
      'Design & Creative',
      'Writing & Translation',
      'Marketing & Sales',
      'Finance & Accounting',
      'Customer Support',
      'Admin Assistance'
    ];

    const defaultSkills = [
      'React',
      'Node.js',
      'JavaScript',
      'TypeScript',
      'Python',
      'UI/UX Design',
      'Figma',
      'Graphic Design',
      'HTML5',
      'CSS3',
      'MongoDB',
      'SQL',
      'WordPress',
      'Copywriting',
      'Content Writing',
      'SEO',
      'Social Media Marketing'
    ];

    // Combine and remove duplicates
    const categories = Array.from(new Set([...defaultCategories, ...dbCategories]));
    const skills = Array.from(new Set([...defaultSkills, ...dbSkills]));

    res.status(200).json({
      success: true,
      categories,
      skills
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
