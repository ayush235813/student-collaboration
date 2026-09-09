const express = require('express');
const router = express.Router();
const {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  joinGroup,
  leaveGroup
} = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

// All group routes require authentication
router.use(protect);

router.route('/')
  .post(createGroup)
  .get(getGroups);

router.route('/:id')
  .get(getGroupById)
  .put(updateGroup)
  .delete(deleteGroup);

router.post('/:id/join', joinGroup);
router.post('/:id/leave', leaveGroup);

module.exports = router;
