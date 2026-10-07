import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { getGroups } from '../api/groupApi';
import { getMyTasks } from '../api/taskApi';

// Map status → badge classes
const STATUS_BADGE = {
  pending: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800'
};

const STATUS_LABEL = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  completed: 'Completed'
};

const DashboardPage = () => {
  const { user } = useAuth();

  const [myGroups, setMyGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  const [myTasks, setMyTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    const fetchMyGroups = async () => {
      try {
        const data = await getGroups(true);
        setMyGroups(data.groups);
      } catch (err) {
        console.error('Failed to fetch groups', err);
      } finally {
        setLoadingGroups(false);
      }
    };

    const fetchMyTasks = async () => {
      try {
        const data = await getMyTasks();
        setMyTasks(data.tasks);
      } catch (err) {
        console.error('Failed to fetch tasks', err);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchMyGroups();
    fetchMyTasks();
  }, []);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—';

  const upcomingTasks = myTasks
    .filter((t) => t.status !== 'completed')
    .slice(0, 5);

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
                {myGroups.slice(0, 5).map((group) => (
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
            <Link to="/groups" className="text-sm font-medium text-primary-600 hover:text-primary-500">
              View all groups &rarr;
            </Link>
          </div>
        </div>

        {/* Assigned Tasks Widget */}
        <div className="bg-white overflow-hidden shadow rounded-lg flex flex-col">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Assigned Tasks</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {upcomingTasks.length} open
            </span>
          </div>
          <div className="p-0 flex-1">
            {loadingTasks ? (
              <div className="p-4 flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              </div>
            ) : upcomingTasks.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {upcomingTasks.map((task) => {
                  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                  return (
                    <li key={task._id} className="p-4">
                      <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                      <p className="mt-0.5 text-xs text-gray-500 truncate">
                        {task.group?.name || 'Unknown Group'}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[task.status]}`}>
                          {STATUS_LABEL[task.status]}
                        </span>
                        {task.dueDate && (
                          <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                            Due {formatDate(task.dueDate)}{isOverdue ? ' ⚠' : ''}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : myTasks.length > 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-green-700 font-medium">🎉 All tasks completed!</p>
                <p className="text-xs text-gray-400 mt-1">Nothing pending right now.</p>
              </div>
            ) : (
              <div className="p-6 text-center text-sm text-gray-500">
                No tasks assigned to you yet.
              </div>
            )}
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6 border-t border-gray-200">
            <span className="text-xs text-gray-500">
              {myTasks.length} total task{myTasks.length !== 1 ? 's' : ''} assigned
            </span>
          </div>
        </div>

        {/* Study Groups placeholder (Phase 5) */}
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
