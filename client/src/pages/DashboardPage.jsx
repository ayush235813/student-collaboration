import useAuth from '../hooks/useAuth';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome back, {user?.name}! Here's what's happening.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder cards for future phases */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">My Groups</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Groups feature will be available in Phase 3.</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Assigned Tasks</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Tasks tracking will be available in Phase 4.</p>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Study Groups</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Study groups will be available in Phase 5.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
