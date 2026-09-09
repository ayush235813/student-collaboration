import api from './axios';

export const getGroups = async (myGroups = false) => {
  const response = await api.get(`/groups${myGroups ? '?myGroups=true' : ''}`);
  return response.data;
};

export const getGroupById = async (id) => {
  const response = await api.get(`/groups/${id}`);
  return response.data;
};

export const createGroup = async (groupData) => {
  const response = await api.post('/groups', groupData);
  return response.data;
};

export const updateGroup = async (id, groupData) => {
  const response = await api.put(`/groups/${id}`, groupData);
  return response.data;
};

export const deleteGroup = async (id) => {
  const response = await api.delete(`/groups/${id}`);
  return response.data;
};

export const joinGroup = async (id) => {
  const response = await api.post(`/groups/${id}/join`);
  return response.data;
};

export const leaveGroup = async (id) => {
  const response = await api.post(`/groups/${id}/leave`);
  return response.data;
};
