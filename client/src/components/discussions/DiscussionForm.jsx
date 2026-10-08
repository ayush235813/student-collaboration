import { useState } from 'react';

const DiscussionForm = ({ initialData = null, onSubmit, onCancel, isSubmitting }) => {
  const isEdit = !!initialData;

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required.');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Discussion Title *</label>
        <input
          type="text"
          name="title"
          required
          value={formData.title}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="e.g., How to implement JWT authentication?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Content *</label>
        <textarea
          name="content"
          required
          rows="5"
          value={formData.content}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          placeholder="Describe your question, idea, or topic for discussion..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none disabled:bg-primary-400"
        >
          {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Post Discussion'}
        </button>
      </div>
    </form>
  );
};

export default DiscussionForm;
