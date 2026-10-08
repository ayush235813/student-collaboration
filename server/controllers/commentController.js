const Comment = require('../models/Comment');
const Discussion = require('../models/Discussion');
const Group = require('../models/Group');
const ApiError = require('../utils/apiError');

// Helper to check membership
const isGroupMember = (group, userId) =>
  group.members.some(m => m.user.toString() === userId.toString());

// Helper to check admin
const isGroupAdmin = (group, userId) =>
  group.admin.toString() === userId.toString();

/**
 * @desc    Create a comment on a discussion
 * @route   POST /api/comments
 * @access  Private (group members only)
 */
const createComment = async (req, res, next) => {
  try {
    const { content, discussionId } = req.body;

    if (!content || !discussionId) {
      return next(new ApiError(400, 'Content and discussion ID are required'));
    }

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) return next(new ApiError(404, 'Discussion not found'));

    const group = await Group.findById(discussion.group);
    if (!group) return next(new ApiError(404, 'Group not found'));

    if (!isGroupMember(group, req.user._id)) {
      return next(new ApiError(403, 'You must be a group member to comment'));
    }

    const comment = await Comment.create({
      content,
      discussion: discussionId,
      createdBy: req.user._id
    });

    await comment.populate('createdBy', 'name profilePicture email');

    // PHASE 8: Notify discussion creator
    if (discussion.createdBy.toString() !== req.user._id.toString()) {
      const Notification = require('../models/Notification');
      await Notification.create({
        recipient: discussion.createdBy,
        type: 'COMMENT_ADDED',
        message: `${req.user.name || 'Someone'} commented on your discussion: ${discussion.title}`,
        relatedGroup: group._id,
        relatedDiscussion: discussion._id,
        relatedComment: comment._id
      });
    }

    res.status(201).json({ success: true, comment });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all comments for a discussion
 * @route   GET /api/comments/discussion/:discussionId
 * @access  Private (group members only)
 */
const getDiscussionComments = async (req, res, next) => {
  try {
    const discussion = await Discussion.findById(req.params.discussionId);
    if (!discussion) return next(new ApiError(404, 'Discussion not found'));

    const group = await Group.findById(discussion.group);

    if (!isGroupMember(group, req.user._id)) {
      return next(new ApiError(403, 'You must be a group member to view comments'));
    }

    const comments = await Comment.find({ discussion: req.params.discussionId })
      .populate('createdBy', 'name profilePicture email')
      .sort('createdAt');

    res.json({ success: true, count: comments.length, comments });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a comment
 * @route   PUT /api/comments/:id
 * @access  Private (Comment creator or Group Admin only)
 */
const updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return next(new ApiError(404, 'Comment not found'));

    const discussion = await Discussion.findById(comment.discussion);
    if (!discussion) return next(new ApiError(404, 'Discussion not found'));

    const group = await Group.findById(discussion.group);

    const isCreator = comment.createdBy.toString() === req.user._id.toString();
    const isAdmin = isGroupAdmin(group, req.user._id);

    if (!isCreator && !isAdmin) {
      return next(new ApiError(403, 'Only the comment creator or group admin can update this comment'));
    }

    if (!req.body.content) {
      return next(new ApiError(400, 'Comment content is required'));
    }

    comment.content = req.body.content;
    await comment.save();
    await comment.populate('createdBy', 'name profilePicture email');

    res.json({ success: true, comment });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a comment
 * @route   DELETE /api/comments/:id
 * @access  Private (Comment creator or Group Admin only)
 */
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return next(new ApiError(404, 'Comment not found'));

    const discussion = await Discussion.findById(comment.discussion);
    if (!discussion) return next(new ApiError(404, 'Discussion not found'));

    const group = await Group.findById(discussion.group);

    const isCreator = comment.createdBy.toString() === req.user._id.toString();
    const isAdmin = isGroupAdmin(group, req.user._id);

    if (!isCreator && !isAdmin) {
      return next(new ApiError(403, 'Only the comment creator or group admin can delete this comment'));
    }

    await comment.deleteOne();

    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComment,
  getDiscussionComments,
  updateComment,
  deleteComment
};
