const Discussion = require('../models/Discussion');
const Comment = require('../models/Comment');
const Group = require('../models/Group');
const ApiError = require('../utils/apiError');

// Helper to check membership
const isGroupMember = (group, userId) =>
  group.members.some(m => m.user.toString() === userId.toString());

// Helper to check admin
const isGroupAdmin = (group, userId) =>
  group.admin.toString() === userId.toString();

/**
 * @desc    Create a new discussion
 * @route   POST /api/discussions
 * @access  Private (group members only)
 */
const createDiscussion = async (req, res, next) => {
  try {
    const { title, content, groupId } = req.body;

    if (!title || !content || !groupId) {
      return next(new ApiError(400, 'Title, content, and group ID are required'));
    }

    const group = await Group.findById(groupId);
    if (!group) return next(new ApiError(404, 'Group not found'));

    if (!isGroupMember(group, req.user._id)) {
      return next(new ApiError(403, 'You must be a member to create discussions in this group'));
    }

    const discussion = await Discussion.create({
      title,
      content,
      group: groupId,
      createdBy: req.user._id
    });

    await discussion.populate('createdBy', 'name profilePicture email');

    // PHASE 8: Notify group members
    const Notification = require('../models/Notification');
    const notificationDocs = group.members
      .filter(m => m.user.toString() !== req.user._id.toString())
      .map(m => ({
        recipient: m.user,
        type: 'DISCUSSION_CREATED',
        message: `${req.user.name || 'A member'} started a new discussion: ${title}`,
        relatedGroup: group._id,
        relatedDiscussion: discussion._id
      }));

    if (notificationDocs.length > 0) {
      await Notification.insertMany(notificationDocs);
    }

    res.status(201).json({ success: true, discussion });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all discussions for a group
 * @route   GET /api/discussions/group/:groupId
 * @access  Private (group members only)
 */
const getGroupDiscussions = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return next(new ApiError(404, 'Group not found'));

    if (!isGroupMember(group, req.user._id)) {
      return next(new ApiError(403, 'You must be a member to view discussions in this group'));
    }

    const discussions = await Discussion.find({ group: req.params.groupId })
      .populate('createdBy', 'name profilePicture email')
      .sort('-createdAt');

    // Attach comment counts
    const discussionIds = discussions.map(d => d._id);
    const commentCounts = await Comment.aggregate([
      { $match: { discussion: { $in: discussionIds } } },
      { $group: { _id: '$discussion', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    commentCounts.forEach(c => { countMap[c._id.toString()] = c.count; });

    const discussionsWithCounts = discussions.map(d => ({
      ...d.toObject(),
      commentCount: countMap[d._id.toString()] || 0
    }));

    res.json({ success: true, count: discussions.length, discussions: discussionsWithCounts });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single discussion by ID
 * @route   GET /api/discussions/:id
 * @access  Private (group members only)
 */
const getDiscussionById = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('createdBy', 'name profilePicture email');

    if (!discussion) return next(new ApiError(404, 'Discussion not found'));

    const group = await Group.findById(discussion.group);

    if (!isGroupMember(group, req.user._id)) {
      return next(new ApiError(403, 'You must be a member to view this discussion'));
    }

    // Count comments
    const commentCount = await Comment.countDocuments({ discussion: discussion._id });

    res.json({ success: true, discussion: { ...discussion.toObject(), commentCount } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a discussion
 * @route   PUT /api/discussions/:id
 * @access  Private (Creator or Group Admin only)
 */
const updateDiscussion = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return next(new ApiError(404, 'Discussion not found'));

    const group = await Group.findById(discussion.group);

    const isCreator = discussion.createdBy.toString() === req.user._id.toString();
    const isAdmin = isGroupAdmin(group, req.user._id);

    if (!isCreator && !isAdmin) {
      return next(new ApiError(403, 'Only the creator or group admin can update this discussion'));
    }

    if (req.body.title) discussion.title = req.body.title;
    if (req.body.content) discussion.content = req.body.content;

    await discussion.save();
    await discussion.populate('createdBy', 'name profilePicture email');

    res.json({ success: true, discussion });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a discussion (and its comments)
 * @route   DELETE /api/discussions/:id
 * @access  Private (Creator or Group Admin only)
 */
const deleteDiscussion = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return next(new ApiError(404, 'Discussion not found'));

    const group = await Group.findById(discussion.group);

    const isCreator = discussion.createdBy.toString() === req.user._id.toString();
    const isAdmin = isGroupAdmin(group, req.user._id);

    if (!isCreator && !isAdmin) {
      return next(new ApiError(403, 'Only the creator or group admin can delete this discussion'));
    }

    // Delete all comments belonging to this discussion
    await Comment.deleteMany({ discussion: discussion._id });
    await discussion.deleteOne();

    res.json({ success: true, message: 'Discussion and its comments deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDiscussion,
  getGroupDiscussions,
  getDiscussionById,
  updateDiscussion,
  deleteDiscussion
};
