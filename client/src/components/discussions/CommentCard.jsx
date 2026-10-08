import { useState } from 'react';

const CommentCard = ({ comment, isCreator, isAdmin, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editContent.trim()) return;
    setEditSubmitting(true);
    await onEdit(comment._id, editContent);
    setEditSubmitting(false);
    setIsEditing(false);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold">
            {comment.createdBy?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <span className="font-medium text-gray-700">{comment.createdBy?.name || 'Unknown'}</span>
          <span>•</span>
          <span>{formatDate(comment.createdAt)}</span>
        </div>

        {(isCreator || isAdmin) && !isEditing && (
          <div className="flex space-x-2">
            <button
              onClick={() => { setIsEditing(true); setEditContent(comment.content); }}
              className="text-xs text-gray-500 hover:text-primary-600 font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(comment._id)}
              className="text-xs text-gray-500 hover:text-red-600 font-medium"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleEditSubmit} className="mt-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows="3"
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editSubmitting}
              className="px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400"
            >
              {editSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
      )}
    </div>
  );
};

export default CommentCard;
