import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
        } catch (err) {
          console.error('Session expired or invalid', err);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const res = await api.post('/auth/register', userData);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (userData) => {
    setError(null);
    try {
      const res = await api.put('/users/profile', userData);
      // Merge updated fields into current user state
      setUser(prev => ({ ...prev, ...res.data.user }));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Profile update failed';
      setError(message);
      return { success: false, message };
    }
  };

  const uploadProfilePicture = async (formData) => {
    setError(null);
    try {
      const res = await api.put('/users/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(prev => ({ ...prev, profilePicture: res.data.profilePicture }));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Image upload failed';
      setError(message);
      return { success: false, message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, updateProfile, uploadProfilePicture }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
