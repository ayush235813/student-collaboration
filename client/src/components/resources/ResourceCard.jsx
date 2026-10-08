const CATEGORY_STYLES = {
  Notes: 'bg-blue-100 text-blue-800',
  Tutorial: 'bg-green-100 text-green-800',
  Documentation: 'bg-gray-100 text-gray-800',
  Video: 'bg-red-100 text-red-800',
  Article: 'bg-purple-100 text-purple-800',
  Other: 'bg-indigo-100 text-indigo-800'
};

const ResourceCard = ({ resource, isCreator, isAdmin, onEdit, onDelete }) => {
  const categoryStyle = CATEGORY_STYLES[resource.category] || CATEGORY_STYLES.Other;
  
  const formatDate = (d) => 
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  // Safety check for absolute URLs
  const getSafeUrl = (url) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  const safeUrl = getSafeUrl(resource.resourceUrl);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-md font-semibold text-gray-900 line-clamp-1 flex-1 mr-2" title={resource.title}>
          {resource.title}
        </h4>
        <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${categoryStyle}`}>
          {resource.category}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">
        {resource.description}
      </p>

      <div className="mt-auto border-t border-gray-100 pt-3">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center space-x-2">
            <span>By <span className="font-medium text-gray-700">{resource.createdBy?.name || 'Unknown'}</span></span>
          </div>
          <span>{formatDate(resource.createdAt)}</span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <a
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex justify-center items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none transition-colors"
          >
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            Open Resource
          </a>
          
          {(isCreator || isAdmin) && (
            <div className="flex shrink-0 space-x-2">
              <button
                onClick={() => onEdit(resource)}
                className="px-2 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors text-xs font-medium"
                title="Edit"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(resource._id)}
                className="px-2 py-1.5 border border-transparent rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors text-xs font-medium"
                title="Delete"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
