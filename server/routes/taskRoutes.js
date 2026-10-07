const express = require('express');
const router = express.Router();
const {
  createTask,
  getGroupTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getMyTasks
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

// All task routes require authentication
router.use(protect);

// IMPORTANT: /my must come before /:id so Express doesn't treat "my" as an id
router.get('/my', getMyTasks);

router.route('/')
  .post(createTask);

router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

router.get('/group/:groupId', getGroupTasks);

module.exports = router;
