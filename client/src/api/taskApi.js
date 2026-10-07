import api from './axios';

// Create a task inside a group
export const createTask = async (taskData) => {
  const response = await api.post('/tasks', taskData);
  return response.data;
};

// Get all tasks for a specific group
export const getGroupTasks = async (groupId) => {
  const response = await api.get(`/tasks/group/${groupId}`);
  return response.data;
};

// Get a single task by its ID
export const getTaskById = async (id) => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
};

// Update a task (admin: any field; assignee: status only)
export const updateTask = async (id, taskData) => {
  const response = await api.put(`/tasks/${id}`, taskData);
  return response.data;
};

// Delete a task (admin only)
export const deleteTask = async (id) => {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
};

// Get tasks assigned to the currently logged-in user
export const getMyTasks = async () => {
  const response = await api.get('/tasks/my');
  return response.data;
};
