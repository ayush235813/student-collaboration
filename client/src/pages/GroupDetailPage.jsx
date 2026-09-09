import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGroupById, joinGroup, leaveGroup, updateGroup, deleteGroup } from '../api/groupApi';
import useAuth from '../hooks/useAuth';

const GroupDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', description: '' });

  const fetchGroup = async () => {
    try {
      setLoading(true);
      const data = await getGroupById(id);
      setGroup(data.group);
      setEditData({ name: data.group.name, description: data.group.description });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch group details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, [id]);

  const handleJoin = async () => {
    try {
      setActionLoading(true);
      setError('');
      setSuccessMessage('');
      await joinGroup(id);
      setSuccessMessage('Successfully joined the group!');
      fetchGroup(); // Refresh group data
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join group.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Are you sure you want to leave this group?')) return;
    try {
      setActionLoading(true);
      setError('');
      setSuccessMessage('');
      await leaveGroup(id);
      setSuccessMessage('Successfully left the group.');
      fetchGroup(); // Refresh group data
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to leave group.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      setError('');
      setSuccessMessage('');
      await updateGroup(id, editData);
      setSuccessMessage('Group updated successfully.');
      setIsEditing(false);
      fetchGroup();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update group.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you absolutely sure you want to delete this group? This action cannot be undone.')) return;
    try {
      setActionLoading(true);
      await deleteGroup(id);
      navigate('/groups');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete group.');
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error && !group) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
        <button onClick={() => navigate('/groups')} className="mt-4 text-primary-600 hover:text-primary-800 font-medium">
          &larr; Back to Groups
        </button>
      </div>
    );
  }

  if (!group) return null;

  const isAdmin = group.admin?._id === user?._id;
  const isMember = group.members?.some((m) => m.user?._id === user?._id);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <button onClick={() => navigate('/groups')} className="mb-6 text-sm text-gray-500 hover:text-gray-900 flex items-center">
        &larr; Back to Groups
      </button>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        {isEditing ? (
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Edit Group</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Group Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows="3"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none disabled:bg-primary-400"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <div className="px-4 py-5 sm:px-6 flex justify-between items-start flex-col sm:flex-row gap-4">
              <div>
                <h3 className="text-2xl leading-6 font-bold text-gray-900">{group.name}</h3>
                <p className="mt-2 max-w-2xl text-sm text-gray-500">{group.description || 'No description provided.'}</p>
                <p className="mt-2 text-xs text-gray-400">Created by {group.admin?.name} on {new Date(group.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex space-x-3 shrink-0">
                {!isMember && (
                  <button
                    onClick={handleJoin}
                    disabled={actionLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:bg-green-400"
                  >
                    {actionLoading ? 'Joining...' : 'Join Group'}
                  </button>
                )}
                {isMember && !isAdmin && (
                  <button
                    onClick={handleLeave}
                    disabled={actionLoading}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    Leave Group
                  </button>
                )}
                {isAdmin && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={actionLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none disabled:bg-red-400"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Members ({group.members?.length || 0})</h4>
              {group.members?.length > 0 ? (
                <ul className="divide-y divide-gray-200 bg-white rounded-md border border-gray-200">
                  {group.members.map((member) => (
                    <li key={member.user._id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold mr-3">
                          {member.user.profilePicture ? (
                            <img src={member.user.profilePicture} alt="" className="h-8 w-8 rounded-full object-cover" />
                          ) : (
                            member.user.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.user.name}</p>
                          <p className="text-gray-500 text-xs">{member.user.course || 'Unknown Course'}</p>
                        </div>
                      </div>
                      <div>
                        {member.role === 'admin' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Member
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No members found.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GroupDetailPage;
