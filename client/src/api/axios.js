import axios from 'axios';

// Create a configured Axios instance for all API calls
// This ensures every request uses the same base URL and settings
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://student-collaboration-mmn4.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor — handle common errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token is expired or invalid, redirect to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Redirect will be handled by AuthContext in Phase 2
    }
    return Promise.reject(error);
  }
);

export default api;
