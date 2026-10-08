const express = require('express');
const router = express.Router();
const {
  createDiscussion,
  getGroupDiscussions,
  getDiscussionById,
  updateDiscussion,
  deleteDiscussion
} = require('../controllers/discussionController');
const { protect } = require('../middleware/auth');

// All discussion routes require authentication
router.use(protect);

router.route('/')
  .post(createDiscussion);

router.get('/group/:groupId', getGroupDiscussions);

router.route('/:id')
  .get(getDiscussionById)
  .put(updateDiscussion)
  .delete(deleteDiscussion);

module.exports = router;
