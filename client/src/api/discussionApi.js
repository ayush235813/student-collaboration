import api from './axios';

// Create a new discussion in a group
export const createDiscussion = async (data) => {
  const response = await api.post('/discussions', data);
  return response.data;
};

// Get all discussions for a specific group
export const getGroupDiscussions = async (groupId) => {
  const response = await api.get(`/discussions/group/${groupId}`);
  return response.data;
};

// Get a single discussion by ID
export const getDiscussionById = async (id) => {
  const response = await api.get(`/discussions/${id}`);
  return response.data;
};

// Update a discussion
export const updateDiscussion = async (id, data) => {
  const response = await api.put(`/discussions/${id}`, data);
  return response.data;
};

// Delete a discussion
export const deleteDiscussion = async (id) => {
  const response = await api.delete(`/discussions/${id}`);
  return response.data;
};
