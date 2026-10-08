import api from './axios';

// Perform a global search
export const searchGlobal = async (query = '', type = 'all', category = '', groupId = '') => {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (type) params.append('type', type);
  if (category) params.append('category', category);
  if (groupId) params.append('groupId', groupId);

  const response = await api.get(`/search?${params.toString()}`);
  return response.data;
};
