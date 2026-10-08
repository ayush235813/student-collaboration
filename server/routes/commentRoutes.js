const express = require('express');
const router = express.Router();
const {
  createComment,
  getDiscussionComments,
  updateComment,
  deleteComment
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

// All comment routes require authentication
router.use(protect);

router.route('/')
  .post(createComment);

router.get('/discussion/:discussionId', getDiscussionComments);

router.route('/:id')
  .put(updateComment)
  .delete(deleteComment);

module.exports = router;
