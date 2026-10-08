const DiscussionCard = ({ discussion, isCreator, isAdmin, onOpen, onEdit, onDelete }) => {
  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onOpen(discussion)}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-md font-semibold text-gray-900 line-clamp-1 flex-1 mr-2" title={discussion.title}>
          {discussion.title}
        </h4>
        <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          {discussion.commentCount || 0} {discussion.commentCount === 1 ? 'reply' : 'replies'}
        </span>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
        {discussion.content}
      </p>

      <div className="flex items-center justify-between mt-auto border-t border-gray-100 pt-3">
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold">
            {discussion.createdBy?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <span className="font-medium text-gray-700">{discussion.createdBy?.name || 'Unknown'}</span>
          <span>•</span>
          <span>{formatDate(discussion.createdAt)}</span>
        </div>

        {(isCreator || isAdmin) && (
          <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onEdit(discussion)}
              className="px-2 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors text-xs font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(discussion._id)}
              className="px-2 py-1 border border-transparent rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors text-xs font-medium"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscussionCard;
