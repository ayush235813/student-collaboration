import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchGlobal } from '../api/searchApi';
import GroupCard from '../components/groups/GroupCard';
import ResourceCard from '../components/resources/ResourceCard';
import DiscussionCard from '../components/discussions/DiscussionCard';
import { useNavigate } from 'react-router-dom';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all';
  const category = searchParams.get('category') || '';

  const [inputValue, setInputValue] = useState(query);
  const [results, setResults] = useState({ groups: [], resources: [], discussions: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchResults = async () => {
    if (!query && type === 'all') {
      setResults({ groups: [], resources: [], discussions: [] });
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      const data = await searchGlobal(query, type, category);
      setResults(data.results);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while searching.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [query, type, category]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ q: inputValue, type, category });
  };

  const handleTypeChange = (newType) => {
    setSearchParams({ q: query, type: newType, category: newType === 'resources' ? category : '' });
  };

  const hasResults = results.groups.length > 0 || results.resources.length > 0 || results.discussions.length > 0;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Search & Discovery</h1>
        <p className="mt-2 text-sm text-gray-600">
          Find groups to join, or discover study resources and discussions from your groups.
        </p>
      </div>

      <div className="bg-white shadow rounded-lg mb-8 p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search groups, resources, discussions..."
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:w-auto w-full">
            <select
              value={type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Results</option>
              <option value="groups">Groups</option>
              <option value="resources">Resources</option>
              <option value="discussions">Discussions</option>
            </select>

            {type === 'resources' && (
              <select
                value={category}
                onChange={(e) => setSearchParams({ q: query, type, category: e.target.value })}
                className="border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Categories</option>
                <option value="Notes">Notes</option>
                <option value="Tutorial">Tutorial</option>
                <option value="Documentation">Documentation</option>
                <option value="Video">Video</option>
                <option value="Article">Article</option>
                <option value="Other">Other</option>
              </select>
            )}

            <button
              type="submit"
              className="bg-primary-600 text-white py-2 px-6 rounded-md hover:bg-primary-700 text-sm font-medium transition-colors"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : !query && type === 'all' ? (
        <div className="text-center py-12 text-gray-500">
          Enter a search query to discover content.
        </div>
      ) : !hasResults ? (
        <div className="text-center py-12 bg-white shadow rounded-lg border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search query or filters.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Groups Section */}
          {(type === 'all' || type === 'groups') && results.groups.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Groups</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {results.groups.map(group => (
                  <GroupCard key={group._id} group={group} isMember={group.isMember} />
                ))}
              </div>
            </div>
          )}

          {/* Resources Section */}
          {(type === 'all' || type === 'resources') && results.resources.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Study Resources</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {results.resources.map(resource => (
                  <ResourceCard 
                    key={resource._id} 
                    resource={resource} 
                    isCreator={false} // Hide edit/delete in search view
                    isAdmin={false}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Discussions Section */}
          {(type === 'all' || type === 'discussions') && results.discussions.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Discussions</h2>
              <div className="space-y-4">
                {results.discussions.map(discussion => (
                  <DiscussionCard 
                    key={discussion._id} 
                    discussion={discussion} 
                    isCreator={false} // Hide edit/delete in search view
                    isAdmin={false}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    onOpen={() => navigate(`/groups/${discussion.group._id}/discussions/${discussion._id}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
