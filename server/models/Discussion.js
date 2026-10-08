const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Discussion title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Discussion content is required']
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: [true, 'Discussion must belong to a group']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient querying by group
discussionSchema.index({ group: 1, createdAt: -1 });

module.exports = mongoose.model('Discussion', discussionSchema);
