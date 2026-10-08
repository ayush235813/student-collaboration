const User = require('../models/User');
const ApiError = require('../utils/apiError');

/**
 * @desc    Get user profile (current user)
 * @route   GET /api/users/profile
 * @access  Private
 */
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        success: true,
        user
      });
    } else {
      return next(new ApiError(404, 'User not found'));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Update fields if they are provided
      user.name = req.body.name || user.name;
      user.college = req.body.college !== undefined ? req.body.college : user.college;
      user.course = req.body.course !== undefined ? req.body.course : user.course;
      user.semester = req.body.semester || user.semester;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      
      if (req.body.skills) user.skills = req.body.skills;
      if (req.body.interests) user.interests = req.body.interests;
      if (req.body.githubUrl !== undefined) user.githubUrl = req.body.githubUrl;
      if (req.body.linkedinUrl !== undefined) user.linkedinUrl = req.body.linkedinUrl;

      // Update password if provided
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          college: updatedUser.college,
          course: updatedUser.course,
          semester: updatedUser.semester,
          skills: updatedUser.skills,
          interests: updatedUser.interests,
          bio: updatedUser.bio,
          githubUrl: updatedUser.githubUrl,
          linkedinUrl: updatedUser.linkedinUrl,
          profilePicture: updatedUser.profilePicture
        }
      });
    } else {
      return next(new ApiError(404, 'User not found'));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload or update profile picture
 * @route   PUT /api/users/profile-picture
 * @access  Private
 */
const uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ApiError(400, 'Please upload an image file'));
    }

    const user = await User.findById(req.user._id);

    if (user) {
      // The file path is provided by Cloudinary via multer-storage-cloudinary
      user.profilePicture = req.file.path;
      
      const updatedUser = await user.save();

      res.json({
        success: true,
        message: 'Profile picture updated successfully',
        profilePicture: updatedUser.profilePicture
      });
    } else {
      return next(new ApiError(404, 'User not found'));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get public profile of any user
 * @route   GET /api/users/:id
 * @access  Private (Authenticated users)
 */
const getPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -email'); // Protect sensitive fields

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    // Gather some stats
    const Group = require('../models/Group');
    const Task = require('../models/Task');
    const Resource = require('../models/Resource');
    const Discussion = require('../models/Discussion');

    const groups = await Group.find({ 'members.user': user._id }).select('name description members');
    const tasksCompleted = await Task.countDocuments({ assignedTo: user._id, status: 'Completed' });
    const resourcesShared = await Resource.countDocuments({ createdBy: user._id });
    const discussionsCreated = await Discussion.countDocuments({ createdBy: user._id });

    // Format groups to only show the ones we share with the requesting user, OR we just show basic info
    // For Phase 9: "Respect existing group privacy/membership rules. Do not expose private group information to unauthorized users."
    // Let's filter groups to only those the requesting user is ALSO a member of.
    const sharedGroups = groups.filter(g => 
      g.members.some(m => m.user.toString() === req.user._id.toString()) || 
      user._id.toString() === req.user._id.toString() // If viewing own profile, see all
    ).map(g => ({
      _id: g._id,
      name: g.name,
      description: g.description,
      memberCount: g.members.length
    }));

    res.json({
      success: true,
      user,
      stats: {
        sharedGroups,
        tasksCompleted,
        resourcesShared,
        discussionsCreated
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  getPublicProfile
};
