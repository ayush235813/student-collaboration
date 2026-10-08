import { useState } from 'react';

const CommentForm = ({ onSubmit, isSubmitting }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit(content);
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-start">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows="2"
        placeholder="Write a reply..."
        className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
      />
      <button
        type="submit"
        disabled={isSubmitting || !content.trim()}
        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none disabled:bg-primary-400 shrink-0"
      >
        {isSubmitting ? 'Posting...' : 'Reply'}
      </button>
    </form>
  );
};

export default CommentForm;
