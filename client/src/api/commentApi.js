import api from './axios';

// Create a comment on a discussion
export const createComment = async (data) => {
  const response = await api.post('/comments', data);
  return response.data;
};

// Get all comments for a discussion
export const getDiscussionComments = async (discussionId) => {
  const response = await api.get(`/comments/discussion/${discussionId}`);
  return response.data;
};

// Update a comment
export const updateComment = async (id, data) => {
  const response = await api.put(`/comments/${id}`, data);
  return response.data;
};

// Delete a comment
export const deleteComment = async (id) => {
  const response = await api.delete(`/comments/${id}`);
  return response.data;
};
