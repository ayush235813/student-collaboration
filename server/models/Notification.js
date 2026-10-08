const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['TASK_ASSIGNED', 'DISCUSSION_CREATED', 'COMMENT_ADDED', 'GROUP_JOIN']
  },
  message: {
    type: String,
    required: true
  },
  relatedGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  relatedTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  relatedDiscussion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Discussion'
  },
  relatedComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
