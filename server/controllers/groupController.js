const Group = require('../models/Group');
const ApiError = require('../utils/apiError');

/**
 * @desc    Create a new group
 * @route   POST /api/groups
 * @access  Private
 */
const createGroup = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return next(new ApiError(400, 'Group name is required'));
    }

    const group = await Group.create({
      name,
      description,
      admin: req.user._id,
      members: [{
        user: req.user._id,
        role: 'admin'
      }]
    });

    res.status(201).json({
      success: true,
      group
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all groups (or filter by user membership)
 * @route   GET /api/groups
 * @access  Private
 */
const getGroups = async (req, res, next) => {
  try {
    // Optional query param: ?myGroups=true
    const filter = req.query.myGroups === 'true' 
      ? { 'members.user': req.user._id } 
      : {};

    const groups = await Group.find(filter)
      .populate('admin', 'name email profilePicture')
      .sort('-createdAt');

    res.json({
      success: true,
      count: groups.length,
      groups
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get group by ID
 * @route   GET /api/groups/:id
 * @access  Private
 */
const getGroupById = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('admin', 'name email profilePicture')
      .populate('members.user', 'name email profilePicture course semester college');

    if (!group) {
      return next(new ApiError(404, 'Group not found'));
    }

    res.json({
      success: true,
      group
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a group
 * @route   PUT /api/groups/:id
 * @access  Private (Admin only)
 */
const updateGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return next(new ApiError(404, 'Group not found'));
    }

    // Check if user is admin
    if (group.admin.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'Not authorized to update this group'));
    }

    group.name = req.body.name || group.name;
    group.description = req.body.description !== undefined ? req.body.description : group.description;

    const updatedGroup = await group.save();

    res.json({
      success: true,
      group: updatedGroup
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a group
 * @route   DELETE /api/groups/:id
 * @access  Private (Admin only)
 */
const deleteGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return next(new ApiError(404, 'Group not found'));
    }

    // Check if user is admin
    if (group.admin.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'Not authorized to delete this group'));
    }

    await group.deleteOne();

    res.json({
      success: true,
      message: 'Group removed'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Join a group
 * @route   POST /api/groups/:id/join
 * @access  Private
 */
const joinGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return next(new ApiError(404, 'Group not found'));
    }

    // Check if already a member
    const isMember = group.members.some(
      member => member.user.toString() === req.user._id.toString()
    );

    if (isMember) {
      return next(new ApiError(400, 'You are already a member of this group'));
    }

    group.members.push({
      user: req.user._id,
      role: 'member'
    });

    await group.save();

    res.json({
      success: true,
      message: 'Successfully joined the group',
      group
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Leave a group
 * @route   POST /api/groups/:id/leave
 * @access  Private
 */
const leaveGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return next(new ApiError(404, 'Group not found'));
    }

    // Prevent admin from leaving without assigning a new admin (simplify for now: admin can't leave)
    if (group.admin.toString() === req.user._id.toString()) {
      return next(new ApiError(400, 'Admin cannot leave the group. Delete it or transfer ownership first.'));
    }

    // Check if member
    const isMember = group.members.some(
      member => member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return next(new ApiError(400, 'You are not a member of this group'));
    }

    group.members = group.members.filter(
      member => member.user.toString() !== req.user._id.toString()
    );

    await group.save();

    res.json({
      success: true,
      message: 'Successfully left the group',
      group
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  joinGroup,
  leaveGroup
};
