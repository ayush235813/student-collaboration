import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicProfile } from '../api/userApi';
import useAuth from '../hooks/useAuth';

const PublicProfilePage = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getPublicProfile(userId);
        setProfile(data.user);
        setStats(data.stats);
        setError('');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
          <p className="text-sm text-red-700">{error || 'User not found'}</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === profile._id;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {isOwnProfile && (
        <div className="mb-4 flex justify-end">
          <Link to="/profile" className="text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors">
            Edit My Profile &rarr;
          </Link>
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="h-32 bg-primary-600"></div>
        <div className="px-4 sm:px-6 lg:px-8 pb-8 relative">
          <div className="sm:flex sm:items-end sm:space-x-5 -mt-12">
            <div className="relative">
              {profile.profilePicture ? (
                <img className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32 object-cover bg-white" src={profile.profilePicture} alt="Profile" />
              ) : (
                <div className="h-24 w-24 rounded-full ring-4 ring-white sm:h-32 sm:w-32 bg-primary-100 flex items-center justify-center text-primary-700 text-4xl font-bold">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="mt-6 sm:mt-0 sm:flex-1 sm:pb-1">
              <h1 className="text-2xl font-bold text-gray-900 truncate">{profile.name}</h1>
              <p className="text-sm text-gray-500">{profile.college ? `${profile.college}` : 'Student'}</p>
            </div>
          </div>
          
          <div className="mt-8 border-t border-gray-200 pt-8">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Course & Semester</dt>
                <dd className="mt-1 text-sm text-gray-900">{profile.course ? `${profile.course}, Sem ${profile.semester}` : 'Not specified'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Bio</dt>
                <dd className="mt-1 text-sm text-gray-900">{profile.bio || 'No bio added.'}</dd>
              </div>
              
              {(profile.skills?.length > 0 || profile.interests?.length > 0) && (
                <div className="sm:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {profile.skills?.length > 0 && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 mb-2">Skills</dt>
                      <dd className="flex flex-wrap gap-2">
                        {profile.skills.map((skill, idx) => (
                          <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {skill}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
                  {profile.interests?.length > 0 && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 mb-2">Interests</dt>
                      <dd className="flex flex-wrap gap-2">
                        {profile.interests.map((interest, idx) => (
                          <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {interest}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
                </div>
              )}

              {(profile.githubUrl || profile.linkedinUrl) && (
                <div className="sm:col-span-2 flex space-x-6">
                  {profile.githubUrl && (
                    <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline flex items-center text-sm font-medium transition-colors">
                      GitHub
                    </a>
                  )}
                  {profile.linkedinUrl && (
                    <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline flex items-center text-sm font-medium transition-colors">
                      LinkedIn
                    </a>
                  )}
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {stats && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Collaboration Stats</h3>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-8">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-primary-600">{stats.sharedGroups?.length || 0}</div>
                <div className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Shared Groups</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-green-600">{stats.tasksCompleted || 0}</div>
                <div className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Tasks Completed</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-blue-600">{stats.resourcesShared || 0}</div>
                <div className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Resources Shared</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-2xl font-bold text-purple-600">{stats.discussionsCreated || 0}</div>
                <div className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Discussions</div>
              </div>
            </div>

            {stats.sharedGroups && stats.sharedGroups.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-3 border-b pb-2">Groups in Common</h4>
                <ul className="divide-y divide-gray-200">
                  {stats.sharedGroups.map(group => (
                    <li key={group._id} className="py-3 flex justify-between items-center">
                      <div>
                        <Link to={`/groups/${group._id}`} className="text-sm font-medium text-primary-600 hover:underline transition-colors">
                          {group.name}
                        </Link>
                        <p className="text-xs text-gray-500 truncate mt-1 max-w-sm">{group.description}</p>
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {group.memberCount} members
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProfilePage;
