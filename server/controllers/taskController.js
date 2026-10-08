const Task = require('../models/Task');
const Group = require('../models/Group');
const ApiError = require('../utils/apiError');

// Helper: check if a userId is a member of a group
const isGroupMember = (group, userId) =>
  group.members.some((m) => m.user.toString() === userId.toString());

// Helper: check if a userId is the admin of a group
const isGroupAdmin = (group, userId) =>
  group.admin.toString() === userId.toString();

/**
 * @desc    Create a new task inside a group
 * @route   POST /api/tasks
 * @access  Private (group admin only)
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, groupId, assignedTo, dueDate, priority } = req.body;

    if (!title) return next(new ApiError(400, 'Task title is required'));
    if (!groupId) return next(new ApiError(400, 'Group ID is required'));

    // Load the group to check membership and admin
    const group = await Group.findById(groupId);
    if (!group) return next(new ApiError(404, 'Group not found'));

    // Only the group admin can create tasks
    if (!isGroupAdmin(group, req.user._id)) {
      return next(new ApiError(403, 'Only the group admin can create tasks'));
    }

    // Validate assignee is a group member (if provided)
    if (assignedTo) {
      if (!isGroupMember(group, assignedTo)) {
        return next(new ApiError(400, 'Assigned user must be a member of this group'));
      }
    }

    const task = await Task.create({
      title,
      description,
      group: groupId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      dueDate: dueDate || null,
      priority: priority || 'medium'
    });

    // Populate for response
    await task.populate('assignedTo', 'name email profilePicture');
    await task.populate('createdBy', 'name email');

    // PHASE 8: Notify assignee
    if (assignedTo && assignedTo.toString() !== req.user._id.toString()) {
      const Notification = require('../models/Notification');
      await Notification.create({
        recipient: assignedTo,
        type: 'TASK_ASSIGNED',
        message: `You were assigned a new task: ${task.title}`,
        relatedTask: task._id,
        relatedGroup: groupId
      });
    }

    res.status(201).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all tasks for a group
 * @route   GET /api/tasks/group/:groupId
 * @access  Private (group members only)
 */
const getGroupTasks = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return next(new ApiError(404, 'Group not found'));

    // Only group members can see tasks
    if (!isGroupMember(group, req.user._id)) {
      return next(new ApiError(403, 'You must be a member of this group to view tasks'));
    }

    const tasks = await Task.find({ group: req.params.groupId })
      .populate('assignedTo', 'name email profilePicture')
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single task by ID
 * @route   GET /api/tasks/:id
 * @access  Private (group members only)
 */
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email profilePicture')
      .populate('createdBy', 'name email')
      .populate('group', 'name admin members');

    if (!task) return next(new ApiError(404, 'Task not found'));

    // Load group to verify membership
    const group = await Group.findById(task.group._id);
    if (!isGroupMember(group, req.user._id)) {
      return next(new ApiError(403, 'You must be a member of this group to view this task'));
    }

    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a task
 * @route   PUT /api/tasks/:id
 * @access  Private (admin can update all fields; assigned member can update status only)
 */
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return next(new ApiError(404, 'Task not found'));

    const group = await Group.findById(task.group);
    if (!group) return next(new ApiError(404, 'Associated group not found'));

    const userId = req.user._id.toString();
    const admin = isGroupAdmin(group, userId);
    const member = isGroupMember(group, userId);

    if (!member) {
      return next(new ApiError(403, 'You must be a member of this group to update tasks'));
    }

    const oldAssignedTo = task.assignedTo?.toString();

    if (admin) {
      // Admin can update all fields
      if (req.body.title) task.title = req.body.title;
      if (req.body.description !== undefined) task.description = req.body.description;
      if (req.body.status) task.status = req.body.status;
      if (req.body.priority) task.priority = req.body.priority;
      if (req.body.dueDate !== undefined) task.dueDate = req.body.dueDate;

      // Validate new assignee is a member
      if (req.body.assignedTo !== undefined) {
        if (req.body.assignedTo && !isGroupMember(group, req.body.assignedTo)) {
          return next(new ApiError(400, 'Assigned user must be a member of this group'));
        }
        task.assignedTo = req.body.assignedTo || null;
      }
    } else {
      // Non-admin members can only update the status of tasks assigned to them
      const isAssignee = task.assignedTo?.toString() === userId;
      if (!isAssignee) {
        return next(new ApiError(403, 'Only the group admin or the assigned member can update this task'));
      }
      if (req.body.status) task.status = req.body.status;
    }

    const updatedTask = await task.save();
    await updatedTask.populate('assignedTo', 'name email profilePicture');
    await updatedTask.populate('createdBy', 'name email');

    // PHASE 8: Notify if assigned to someone new
    if (admin && req.body.assignedTo && req.body.assignedTo !== oldAssignedTo) {
      if (req.body.assignedTo.toString() !== req.user._id.toString()) {
        const Notification = require('../models/Notification');
        await Notification.create({
          recipient: req.body.assignedTo,
          type: 'TASK_ASSIGNED',
          message: `You were assigned a task: ${updatedTask.title}`,
          relatedTask: updatedTask._id,
          relatedGroup: group._id
        });
      }
    }

    res.json({ success: true, task: updatedTask });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 * @access  Private (group admin only)
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return next(new ApiError(404, 'Task not found'));

    const group = await Group.findById(task.group);
    if (!isGroupAdmin(group, req.user._id)) {
      return next(new ApiError(403, 'Only the group admin can delete tasks'));
    }

    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all tasks assigned to the currently logged-in user
 * @route   GET /api/tasks/my
 * @access  Private
 */
const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('group', 'name')
      .populate('createdBy', 'name email')
      .sort('dueDate');

    res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getGroupTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getMyTasks
};
