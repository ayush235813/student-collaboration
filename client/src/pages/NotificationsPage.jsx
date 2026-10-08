import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../api/notificationApi';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data.notifications);
    } catch (err) {
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }
    
    // Navigate based on type
    if (notification.type === 'GROUP_JOIN' && notification.relatedGroup) {
      navigate(`/groups/${notification.relatedGroup._id || notification.relatedGroup}`);
    } else if (notification.type === 'TASK_ASSIGNED' && notification.relatedGroup) {
      navigate(`/groups/${notification.relatedGroup._id || notification.relatedGroup}`);
    } else if ((notification.type === 'DISCUSSION_CREATED' || notification.type === 'COMMENT_ADDED') && notification.relatedGroup && notification.relatedDiscussion) {
      navigate(`/groups/${notification.relatedGroup._id || notification.relatedGroup}/discussions/${notification.relatedDiscussion._id || notification.relatedDiscussion}`);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'TASK_ASSIGNED': return '📋';
      case 'DISCUSSION_CREATED': return '🗣️';
      case 'COMMENT_ADDED': return '💬';
      case 'GROUP_JOIN': return '👋';
      default: return '🔔';
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        {notifications.some(n => !n.isRead) && (
          <button 
            onClick={handleMarkAllAsRead}
            className="text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 bg-white shadow rounded-lg border border-gray-200">
          <span className="text-4xl">📭</span>
          <h3 className="mt-4 text-sm font-medium text-gray-900">All caught up!</h3>
          <p className="mt-1 text-sm text-gray-500">You have no notifications.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {notifications.map(notification => (
              <li 
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`hover:bg-gray-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-primary-50/30' : ''}`}
              >
                <div className="px-4 py-4 sm:px-6 flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1 text-xl">
                      {getIcon(notification.type)}
                    </div>
                    <div className="ml-4">
                      <p className={`text-sm ${!notification.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 ml-4">
                    {!notification.isRead && (
                      <span className="h-2.5 w-2.5 rounded-full bg-primary-600"></span>
                    )}
                    <button 
                      onClick={(e) => handleDelete(notification._id, e)}
                      className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded"
                      title="Delete"
                      aria-label="Delete notification"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
