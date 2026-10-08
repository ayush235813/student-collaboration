const Group = require('../models/Group');
const Resource = require('../models/Resource');
const Discussion = require('../models/Discussion');
const ApiError = require('../utils/apiError');

/**
 * @desc    Global search for groups, resources, and discussions
 * @route   GET /api/search?q=<query>&type=<all|groups|resources|discussions>&category=<category>&groupId=<groupId>
 * @access  Private
 */
const search = async (req, res, next) => {
  try {
    const q = req.query.q || '';
    const type = req.query.type || 'all';
    const categoryFilter = req.query.category || '';
    const groupFilter = req.query.groupId || '';

    // Create a case-insensitive regex for the search query
    const regex = new RegExp(q, 'i');

    let results = {
      groups: [],
      resources: [],
      discussions: []
    };

    // Find all groups the user is a member of (for restricting resources & discussions)
    const userGroupsList = await Group.find({ 'members.user': req.user._id }).select('_id');
    const userGroupIds = userGroupsList.map(g => g._id);

    // SEARCH GROUPS
    if (type === 'all' || type === 'groups') {
      const groups = await Group.find({
        $or: [
          { name: regex },
          { description: regex }
        ]
      })
      .populate('admin', 'name profilePicture')
      .select('-inviteCode') // Don't expose invite codes in search
      .limit(50);
      
      results.groups = groups.map(g => {
        const obj = g.toObject();
        obj.isMember = obj.members.some(m => m.user.toString() === req.user._id.toString());
        // Remove full members list to keep payload light, just send count
        obj.memberCount = obj.members.length;
        delete obj.members;
        return obj;
      });
    }

    // SEARCH RESOURCES
    if (type === 'all' || type === 'resources') {
      let resourceQuery = {
        group: { $in: userGroupIds },
        $or: [
          { title: regex },
          { description: regex }
        ]
      };
      
      if (categoryFilter) {
        resourceQuery.category = categoryFilter;
      }
      
      // If filtering by a specific group, ensure the user is actually a member of it
      if (groupFilter) {
        if (!userGroupIds.some(id => id.toString() === groupFilter)) {
          // If they request a group they aren't in, return nothing
          resourceQuery.group = null; 
        } else {
          resourceQuery.group = groupFilter;
        }
      }

      results.resources = await Resource.find(resourceQuery)
        .populate('createdBy', 'name profilePicture')
        .populate('group', 'name')
        .limit(50)
        .sort('-createdAt');
    }

    // SEARCH DISCUSSIONS
    if (type === 'all' || type === 'discussions') {
      let discussionQuery = {
        group: { $in: userGroupIds },
        $or: [
          { title: regex },
          { content: regex }
        ]
      };
      
      if (groupFilter) {
        if (!userGroupIds.some(id => id.toString() === groupFilter)) {
          discussionQuery.group = null; 
        } else {
          discussionQuery.group = groupFilter;
        }
      }

      results.discussions = await Discussion.find(discussionQuery)
        .populate('createdBy', 'name profilePicture')
        .populate('group', 'name')
        .limit(50)
        .sort('-createdAt');
    }

    res.json({
      success: true,
      results
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  search
};
