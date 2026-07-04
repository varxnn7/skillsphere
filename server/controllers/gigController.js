const Gig = require('../models/Gig');
const FreelancerProfile = require('../models/FreelancerProfile');
const ClientProfile = require('../models/ClientProfile');
const sendEmail = require('../utils/email');

// @desc    Create a new gig
// @route   POST /api/gigs
// @access  Private (Client only)
exports.createGig = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      subCategory,
      skills,
      budgetType,
      budgetMin,
      budgetMax,
      duration,
      experienceLevel,
      location,
      isRemote,
      attachments,
      milestones
    } = req.body;

    // Validate fields
    if (!title || !description || !category || !skills || !budgetMin || !budgetMax || !duration) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const gig = await Gig.create({
      title,
      description,
      client: req.user.id,
      category,
      subCategory,
      skills: Array.isArray(skills) ? skills : [skills],
      budgetType,
      budgetMin,
      budgetMax,
      duration,
      experienceLevel,
      location,
      isRemote,
      attachments: attachments || [],
      milestones: milestones || [],
      status: 'open',
      isApproved: true // Default true for development testing convenience
    });

    // Auto-notify matching freelancers (by skills)
    try {
      const gigSkillsLower = gig.skills.map(s => s.toLowerCase());
      const matchingFreelancers = await FreelancerProfile.find({
        'skills.name': { 
          $in: gig.skills.map(skill => new RegExp(`^${skill.trim()}$`, 'i')) 
        }
      }).populate('user');

      if (matchingFreelancers && matchingFreelancers.length > 0) {
        for (const freelancerProfile of matchingFreelancers) {
          const user = freelancerProfile.user;
          if (user && user.email) {
            const message = `Hello ${user.name},\n\nA new gig matching your skills has been posted on SkillSphere: "${gig.title}" in the ${gig.category} category.\n\nBudget: ₹${gig.budgetMin} - ₹${gig.budgetMax}\n\nView details and apply now!`;
            const html = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #7C3AED;">New Gig Match!</h2>
                <p>Hi ${user.name},</p>
                <p>A new gig matching your skills has been posted on SkillSphere:</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0;">
                  <h3 style="margin: 0; color: #1e293b;">${gig.title}</h3>
                  <p style="font-size: 14px; color: #64748b;">${gig.category} · ${gig.budgetType === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}</p>
                  <p style="font-size: 15px; font-weight: bold; color: #7C3AED; margin: 5px 0;">Budget: ₹${gig.budgetMin} - ₹${gig.budgetMax}</p>
                </div>
                <div style="text-align: center; margin: 25px 0;">
                  <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/gigs/${gig._id}" style="background-color: #7C3AED; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View and Apply</a>
                </div>
              </div>
            `;
            await sendEmail({
              email: user.email,
              subject: `SkillSphere - New Gig Alert: ${gig.title}`,
              message,
              html
            }).catch(err => console.error('Error sending matching gig notification email:', err.message));
          }
        }
      }
    } catch (notifyErr) {
      console.error('Failed to notify matching freelancers:', notifyErr.message);
    }

    res.status(201).json({ success: true, gig });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all approved gigs with filters
// @route   GET /api/gigs
// @access  Public
exports.getGigs = async (req, res, next) => {
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

    // Apply filters
    if (category) {
      query.category = category;
    }

    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      query.skills = { $in: skillsArray.map(skill => new RegExp(`^${skill}$`, 'i')) };
    }

    if (budgetMin || budgetMax) {
      if (budgetMin) {
        query.budgetMax = { $gte: Number(budgetMin) };
      }
      if (budgetMax) {
        query.budgetMin = { $lte: Number(budgetMax) };
      }
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

    // Text search on title + description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Define Sorting
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

    // Pagination
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

// @desc    Get a single gig with client profile + proposal count
// @route   GET /api/gigs/:id
// @access  Public
exports.getGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id)
      .populate({
        path: 'client',
        select: 'name email avatar createdAt'
      });

    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    // Fetch client profile stats
    const clientProfile = await ClientProfile.findOne({ user: gig.client._id });
    
    // Structure response object with client ratings
    const gigObj = gig.toObject();
    if (gigObj.client) {
      gigObj.client.rating = clientProfile ? clientProfile.averageRating : 0;
      gigObj.client.location = clientProfile ? clientProfile.location : '';
      gigObj.client.totalPosted = clientProfile ? clientProfile.totalPosted : 0;
      gigObj.client.totalSpent = clientProfile ? clientProfile.totalSpent : 0;
      gigObj.client.createdAt = gig.client.createdAt;
    }

    res.status(200).json({ success: true, gig: gigObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a gig
// @route   PUT /api/gigs/:id
// @access  Private (Client Owner only)
exports.updateGig = async (req, res, next) => {
  try {
    let gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    // Make sure user is gig owner
    if (gig.client.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this gig' });
    }

    gig = await Gig.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, gig });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a gig
// @route   DELETE /api/gigs/:id
// @access  Private (Client Owner or Admin)
exports.deleteGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    // Make sure user is client owner OR admin
    if (gig.client.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this gig' });
    }

    await Gig.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Gig deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Increment gig views
// @route   POST /api/gigs/:id/view
// @access  Public
exports.incrementViews = async (req, res, next) => {
  try {
    const gig = await Gig.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    res.status(200).json({ success: true, views: gig.views });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in client's gigs
// @route   GET /api/gigs/client/my-gigs
// @access  Private (Client only)
exports.getMyGigs = async (req, res, next) => {
  try {
    const gigs = await Gig.find({ client: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: gigs.length, gigs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get gigs by category
// @route   GET /api/gigs/category/:category
// @access  Public
// @desc    Get gigs by category
// @route   GET /api/gigs/category/:category
// @access  Public
exports.getGigsByCategory = async (req, res, next) => {
  try {
    const gigs = await Gig.find({ category: req.params.category, isApproved: true }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: gigs.length, gigs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update milestone status to in-progress
// @route   PUT /api/gigs/:id/milestones/:index/in-progress
// @access  Private (Freelancer)
exports.updateMilestoneInProgress = async (req, res, next) => {
  try {
    const Proposal = require('../models/Proposal');
    const index = parseInt(req.params.index, 10);
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    const proposal = await Proposal.findOne({ gig: gig._id, status: 'accepted' });
    if (!proposal || proposal.freelancer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the assigned freelancer can update milestone status' });
    }

    if (!gig.milestones || !gig.milestones[index]) {
      return res.status(404).json({ success: false, message: 'Milestone not found' });
    }

    gig.milestones[index].status = 'in-progress';
    await gig.save();

    res.status(200).json({ success: true, message: 'Milestone marked as in progress', gig });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit milestone deliverables
// @route   PUT /api/gigs/:id/milestones/:index/submit
// @access  Private (Freelancer)
exports.updateMilestoneSubmit = async (req, res, next) => {
  try {
    const Proposal = require('../models/Proposal');
    const Notification = require('../models/Notification');
    const index = parseInt(req.params.index, 10);
    const { notes, fileUrl, fileName } = req.body;
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    const proposal = await Proposal.findOne({ gig: gig._id, status: 'accepted' });
    if (!proposal || proposal.freelancer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the assigned freelancer can submit deliverables' });
    }

    if (!gig.milestones || !gig.milestones[index]) {
      return res.status(404).json({ success: false, message: 'Milestone not found' });
    }

    gig.milestones[index].status = 'submitted';
    // Append deliverable info to milestone description (or store it in description)
    const deliverableText = `\n[DELIVERABLE: ${fileName || 'Deliverable file'} | URL: ${fileUrl}]` + (notes ? `\nNotes: ${notes}` : '');
    gig.milestones[index].description = (gig.milestones[index].description || '') + deliverableText;

    await gig.save();

    // Notify client
    await Notification.create({
      user: gig.client,
      type: 'milestone_submitted',
      title: 'Milestone Submitted for Review',
      message: `Freelancer submitted deliverables for Milestone #${index + 1} of "${gig.title}".`,
      link: `/project/${gig._id}/tracker`
    });

    res.status(200).json({ success: true, message: 'Milestone deliverables submitted successfully', gig });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Request revision for milestone
// @route   PUT /api/gigs/:id/milestones/:index/revision
// @access  Private (Client)
exports.updateMilestoneRevision = async (req, res, next) => {
  try {
    const Proposal = require('../models/Proposal');
    const Notification = require('../models/Notification');
    const index = parseInt(req.params.index, 10);
    const { notes } = req.body;
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    if (gig.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the client can request milestone revision' });
    }

    const proposal = await Proposal.findOne({ gig: gig._id, status: 'accepted' });
    if (!proposal) {
      return res.status(400).json({ success: false, message: 'No active contract found for this gig' });
    }

    if (!gig.milestones || !gig.milestones[index]) {
      return res.status(404).json({ success: false, message: 'Milestone not found' });
    }

    gig.milestones[index].status = 'in-progress';
    const revisionText = `\n[Revision requested: ${notes || 'Please refine the work.'}]`;
    gig.milestones[index].description = (gig.milestones[index].description || '') + revisionText;

    await gig.save();

    // Notify freelancer
    await Notification.create({
      user: proposal.freelancer,
      type: 'milestone_revision',
      title: 'Revision Requested on Milestone',
      message: `Client requested a revision for Milestone #${index + 1} of "${gig.title}".`,
      link: `/project/${gig._id}/tracker`
    });

    res.status(200).json({ success: true, message: 'Milestone revision requested successfully', gig });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

