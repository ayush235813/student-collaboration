const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Resource description is required']
  },
  resourceUrl: {
    type: String,
    required: [true, 'Resource URL is required'],
    match: [/^https?:\/\/.+/, 'Please provide a valid URL starting with http:// or https://']
  },
  category: {
    type: String,
    required: [true, 'Resource category is required'],
    enum: ['Notes', 'Tutorial', 'Documentation', 'Video', 'Article', 'Other'],
    default: 'Other'
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: [true, 'Resource must belong to a group']
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
resourceSchema.index({ group: 1, createdAt: -1 });

module.exports = mongoose.model('Resource', resourceSchema);
