import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDiscussionById, updateDiscussion, deleteDiscussion } from '../api/discussionApi';
import { getDiscussionComments, createComment, updateComment, deleteComment } from '../api/commentApi';
import useAuth from '../hooks/useAuth';
import CommentCard from '../components/discussions/CommentCard';
import CommentForm from '../components/discussions/CommentForm';

const DiscussionDetailPage = () => {
  const { id, discussionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [discussion, setDiscussion] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentError, setCommentError] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Edit discussion state
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', content: '' });
  const [editSubmitting, setEditSubmitting] = useState(false);

  const fetchDiscussion = async () => {
    try {
      setLoading(true);
      const data = await getDiscussionById(discussionId);
      setDiscussion(data.discussion);
      setEditData({ title: data.discussion.title, content: data.discussion.content });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load discussion.');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const data = await getDiscussionComments(discussionId);
      setComments(data.comments);
      setCommentError('');
    } catch (err) {
      setCommentError(err.response?.data?.message || 'Failed to load comments.');
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussion();
    fetchComments();
  }, [discussionId]);

  const isCreator = discussion?.createdBy?._id === user?._id;
  // We don't have group data on this page, so we rely on the backend for admin checks.
  // For the UI, we show edit/delete if the user is the creator. Group admin checks happen server-side.
  // To improve UX, we can try to detect admin from the discussion response if needed.

  const handleCommentSubmit = async (content) => {
    try {
      setCommentSubmitting(true);
      setCommentError('');
      const data = await createComment({ content, discussionId });
      setComments((prev) => [...prev, data.comment]);
    } catch (err) {
      setCommentError(err.response?.data?.message || 'Failed to post comment.');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleCommentEdit = async (commentId, content) => {
    try {
      const data = await updateComment(commentId, { content });
      setComments((prev) => prev.map((c) => (c._id === commentId ? data.comment : c)));
    } catch (err) {
      setCommentError(err.response?.data?.message || 'Failed to update comment.');
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      setCommentError(err.response?.data?.message || 'Failed to delete comment.');
    }
  };

  const handleEditDiscussion = async (e) => {
    e.preventDefault();
    if (!editData.title.trim() || !editData.content.trim()) return;
    try {
      setEditSubmitting(true);
      const data = await updateDiscussion(discussionId, editData);
      setDiscussion(data.discussion);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update discussion.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteDiscussion = async () => {
    if (!window.confirm('Delete this discussion and all its comments?')) return;
    try {
      await deleteDiscussion(discussionId);
      navigate(`/groups/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete discussion.');
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error && !discussion) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
        <button onClick={() => navigate(`/groups/${id}`)} className="mt-4 text-sm text-primary-600 hover:text-primary-500 transition-colors">
          &larr; Back to group
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Back link */}
      <button onClick={() => navigate(`/groups/${id}`)} className="text-sm text-primary-600 hover:text-primary-500 font-medium transition-colors">
        &larr; Back to group
      </button>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Discussion detail card */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          {isEditing ? (
            <form onSubmit={handleEditDiscussion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <textarea
                  value={editData.content}
                  onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                  rows="5"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={editSubmitting} className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 transition-colors">
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-gray-900">{discussion.title}</h2>
                {isCreator && (
                  <div className="flex space-x-2 shrink-0 ml-4">
                    <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-xs font-medium transition-colors">Edit</button>
                    <button onClick={handleDeleteDiscussion} className="px-3 py-1.5 border border-transparent rounded text-white bg-red-600 hover:bg-red-700 text-xs font-medium transition-colors">Delete</button>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-3 text-xs text-gray-500">
                <div className="h-7 w-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold">
                  {discussion.createdBy?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <span className="font-medium text-gray-700">{discussion.createdBy?.name || 'Unknown'}</span>
                <span>•</span>
                <span>{formatDate(discussion.createdAt)}</span>
              </div>
              <div className="mt-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {discussion.content}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Comments section */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Comments
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              {comments.length}
            </span>
          </h3>
        </div>

        <div className="px-4 py-5 sm:p-6 space-y-4">
          {/* Comment form */}
          <CommentForm onSubmit={handleCommentSubmit} isSubmitting={commentSubmitting} />

          {commentError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3">
              <p className="text-sm text-red-700">{commentError}</p>
            </div>
          )}

          {/* Comments list */}
          {commentsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-3">
              {comments.map((comment) => (
                <CommentCard
                  key={comment._id}
                  comment={comment}
                  isCreator={comment.createdBy?._id === user?._id}
                  isAdmin={false}
                  onEdit={handleCommentEdit}
                  onDelete={handleCommentDelete}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No comments yet. Be the first to reply!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscussionDetailPage;
