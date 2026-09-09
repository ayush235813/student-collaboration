import { Link } from 'react-router-dom';

const GroupCard = ({ group, isMember }) => {
  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-lg leading-6 font-medium text-gray-900 truncate">
            {group.name}
          </h3>
          {isMember && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Member
            </span>
          )}
        </div>
        <p className="mt-2 max-w-xl text-sm text-gray-500 line-clamp-2 min-h-[2.5rem]">
          {group.description || 'No description provided.'}
        </p>
        <div className="mt-4 flex items-center text-xs text-gray-500">
          <span className="flex items-center mr-4">
            <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            {group.members?.length || 0} Members
          </span>
          <span className="flex items-center">
            <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Admin: {group.admin?.name || 'Unknown'}
          </span>
        </div>
        <div className="mt-5">
          <Link
            to={`/groups/${group._id}`}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GroupCard;
