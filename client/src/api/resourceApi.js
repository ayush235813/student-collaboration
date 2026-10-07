import api from './axios';

// Create a new resource in a group
export const createResource = async (resourceData) => {
  const response = await api.post('/resources', resourceData);
  return response.data;
};

// Get all resources for a specific group
export const getGroupResources = async (groupId) => {
  const response = await api.get(`/resources/group/${groupId}`);
  return response.data;
};

// Get a single resource by ID
export const getResourceById = async (id) => {
  const response = await api.get(`/resources/${id}`);
  return response.data;
};

// Update a resource
export const updateResource = async (id, resourceData) => {
  const response = await api.put(`/resources/${id}`, resourceData);
  return response.data;
};

// Delete a resource
export const deleteResource = async (id) => {
  const response = await api.delete(`/resources/${id}`);
  return response.data;
};

// Get recent resources for dashboard
export const getRecentResources = async () => {
  const response = await api.get('/resources/recent');
  return response.data;
};
