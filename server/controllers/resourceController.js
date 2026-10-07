const Resource = require('../models/Resource');
const Group = require('../models/Group');
const ApiError = require('../utils/apiError');

// Helper to check membership
const isGroupMember = (group, userId) => 
  group.members.some(m => m.user.toString() === userId.toString());

// Helper to check admin
const isGroupAdmin = (group, userId) => 
  group.admin.toString() === userId.toString();

/**
 * @desc    Create a new resource
 * @route   POST /api/resources
 * @access  Private (group members only)
 */
const createResource = async (req, res, next) => {
  try {
    const { title, description, resourceUrl, category, groupId } = req.body;

    if (!title || !description || !resourceUrl || !groupId) {
      return next(new ApiError(400, 'Title, description, resource URL, and group ID are required'));
    }

    const group = await Group.findById(groupId);
    if (!group) return next(new ApiError(404, 'Group not found'));

    if (!isGroupMember(group, req.user._id)) {
      return next(new ApiError(403, 'You must be a member to share resources in this group'));
    }

    const resource = await Resource.create({
      title,
      description,
      resourceUrl,
      category: category || 'Other',
      group: groupId,
      createdBy: req.user._id
    });

    await resource.populate('createdBy', 'name profilePicture email');

    res.status(201).json({ success: true, resource });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all resources for a group
 * @route   GET /api/resources/group/:groupId
 * @access  Private (group members only)
 */
const getGroupResources = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return next(new ApiError(404, 'Group not found'));

    if (!isGroupMember(group, req.user._id)) {
      return next(new ApiError(403, 'You must be a member to view resources in this group'));
    }

    const resources = await Resource.find({ group: req.params.groupId })
      .populate('createdBy', 'name profilePicture email')
      .sort('-createdAt');

    res.json({ success: true, count: resources.length, resources });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single resource
 * @route   GET /api/resources/:id
 * @access  Private (group members only)
 */
const getResourceById = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('createdBy', 'name profilePicture email')
      .populate('group', 'name members admin');

    if (!resource) return next(new ApiError(404, 'Resource not found'));

    if (!isGroupMember(resource.group, req.user._id)) {
      return next(new ApiError(403, 'You must be a member to view this resource'));
    }

    // Don't send full group details back, just what's needed
    const resourceData = resource.toObject();
    delete resourceData.group.members;

    res.json({ success: true, resource: resourceData });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a resource
 * @route   PUT /api/resources/:id
 * @access  Private (Creator or Group Admin only)
 */
const updateResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return next(new ApiError(404, 'Resource not found'));

    const group = await Group.findById(resource.group);
    
    const isCreator = resource.createdBy.toString() === req.user._id.toString();
    const isAdmin = isGroupAdmin(group, req.user._id);

    if (!isCreator && !isAdmin) {
      return next(new ApiError(403, 'Only the creator or group admin can update this resource'));
    }

    // Update allowed fields
    if (req.body.title) resource.title = req.body.title;
    if (req.body.description) resource.description = req.body.description;
    if (req.body.resourceUrl) resource.resourceUrl = req.body.resourceUrl;
    if (req.body.category) resource.category = req.body.category;

    await resource.save();
    await resource.populate('createdBy', 'name profilePicture email');

    res.json({ success: true, resource });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a resource
 * @route   DELETE /api/resources/:id
 * @access  Private (Creator or Group Admin only)
 */
const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return next(new ApiError(404, 'Resource not found'));

    const group = await Group.findById(resource.group);

    const isCreator = resource.createdBy.toString() === req.user._id.toString();
    const isAdmin = isGroupAdmin(group, req.user._id);

    if (!isCreator && !isAdmin) {
      return next(new ApiError(403, 'Only the creator or group admin can delete this resource'));
    }

    await resource.deleteOne();

    res.json({ success: true, message: 'Resource deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recent resources from all groups the user is a member of
 * @route   GET /api/resources/recent
 * @access  Private
 */
const getRecentResources = async (req, res, next) => {
  try {
    // Find all groups where the user is a member
    const userGroups = await Group.find({ 'members.user': req.user._id }).select('_id');
    const groupIds = userGroups.map(g => g._id);

    // Find resources belonging to these groups, sorted by newest
    const resources = await Resource.find({ group: { $in: groupIds } })
      .populate('createdBy', 'name profilePicture')
      .populate('group', 'name')
      .sort('-createdAt')
      .limit(5); // latest 5

    res.json({ success: true, count: resources.length, resources });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createResource,
  getGroupResources,
  getResourceById,
  updateResource,
  deleteResource,
  getRecentResources
};
