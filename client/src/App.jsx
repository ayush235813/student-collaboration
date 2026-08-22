import { useState, useEffect } from 'react';
import api from './api/axios';
import './App.css';

function App() {
  const [apiStatus, setApiStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Test the backend connection when the app loads
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await api.get('/test');
        setApiStatus(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🎓 Student Collaboration
          </h1>
          <p className="text-gray-500 text-sm">
            Platform Setup — Phase 1
          </p>
        </div>

        {/* Divider */}
        <hr className="border-gray-200 mb-6" />

        {/* Status Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">System Status</h2>

          {/* Frontend Status */}
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span className="text-green-700 font-medium">Frontend (React + Vite)</span>
            <span className="ml-auto text-green-600 text-sm">Running</span>
          </div>

          {/* Tailwind Status */}
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span className="text-green-700 font-medium">Tailwind CSS</span>
            <span className="ml-auto text-green-600 text-sm">Active</span>
          </div>

          {/* Backend Status */}
          <div className={`flex items-center gap-3 p-3 rounded-lg ${
            loading ? 'bg-yellow-50' : error ? 'bg-red-50' : 'bg-green-50'
          }`}>
            <span className={`w-3 h-3 rounded-full ${
              loading ? 'bg-yellow-500 animate-pulse' : error ? 'bg-red-500' : 'bg-green-500'
            }`}></span>
            <span className={`font-medium ${
              loading ? 'text-yellow-700' : error ? 'text-red-700' : 'text-green-700'
            }`}>
              Backend (Express API)
            </span>
            <span className={`ml-auto text-sm ${
              loading ? 'text-yellow-600' : error ? 'text-red-600' : 'text-green-600'
            }`}>
              {loading ? 'Connecting...' : error ? 'Error' : 'Connected'}
            </span>
          </div>

          {/* API Response */}
          {apiStatus && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 font-mono">
                API Response: <span className="text-primary-600 font-semibold">{apiStatus.message}</span>
              </p>
              <p className="text-sm text-gray-500 font-mono mt-1">
                Environment: <span className="font-semibold">{apiStatus.environment}</span>
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">
                ⚠️ Could not connect to backend: {error}
              </p>
              <p className="text-xs text-red-500 mt-1">
                Make sure the server is running on port 5000
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Phase 1 Setup Complete — Ready for Phase 2
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
