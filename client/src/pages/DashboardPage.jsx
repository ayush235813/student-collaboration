import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { getGroups } from '../api/groupApi';

const DashboardPage = () => {
  const { user } = useAuth();
  const [myGroups, setMyGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  useEffect(() => {
    const fetchMyGroups = async () => {
      try {
        const data = await getGroups(true); // pass true for myGroups filter
        setMyGroups(data.groups);
      } catch (err) {
        console.error('Failed to fetch groups', err);
      } finally {
        setLoadingGroups(false);
      }
    };
    
    fetchMyGroups();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome back, {user?.name}! Here's what's happening.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* My Groups Widget */}
        <div className="bg-white overflow-hidden shadow rounded-lg flex flex-col">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">My Groups</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
              {myGroups.length}
            </span>
          </div>
          <div className="p-0 flex-1">
            {loadingGroups ? (
              <div className="p-4 flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              </div>
            ) : myGroups.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {myGroups.slice(0, 5).map(group => (
                  <li key={group._id} className="p-4 hover:bg-gray-50 transition-colors">
                    <Link to={`/groups/${group._id}`} className="block">
                      <p className="text-sm font-medium text-primary-600 truncate">{group.name}</p>
                      <p className="mt-1 text-xs text-gray-500 truncate">{group.description || 'No description'}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center text-sm text-gray-500">
                You haven't joined any groups yet.
              </div>
            )}
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200">
            <div className="text-sm">
              <Link to="/groups" className="font-medium text-primary-600 hover:text-primary-500">
                View all groups &rarr;
              </Link>
            </div>
          </div>
        </div>
        
        {/* Placeholder cards for future phases */}
        <div className="bg-white overflow-hidden shadow rounded-lg flex flex-col opacity-75">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Assigned Tasks</h3>
          </div>
          <div className="px-4 py-5 sm:p-6 flex-1 flex items-center justify-center text-sm text-gray-500 text-center">
            <p>Tasks tracking will be available in Phase 4.</p>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg flex flex-col opacity-75">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Study Groups</h3>
          </div>
          <div className="px-4 py-5 sm:p-6 flex-1 flex items-center justify-center text-sm text-gray-500 text-center">
            <p>Study groups will be available in Phase 5.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
