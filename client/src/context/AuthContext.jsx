import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Synchronously initialize user from localStorage so browser refresh never redirects prematurely
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('career_mentor_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(() => {
    const token = localStorage.getItem('career_mentor_token');
    const savedUser = localStorage.getItem('career_mentor_user');
    // If no token exists, there is no session to wait for
    if (!token) return false;
    // If token exists and cached user is present, render immediately
    // If token exists but user isn't cached yet, keep loading until /auth/me responds
    return !savedUser;
  });

  // Fetch and validate current user on initial mount
  const checkAuth = async () => {
    const token = localStorage.getItem('career_mentor_token');
    if (!token && !document.cookie.includes('token=')) {
      setUser(null);
      localStorage.removeItem('career_mentor_user');
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('career_mentor_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 404) {
        setUser(null);
        localStorage.removeItem('career_mentor_token');
        localStorage.removeItem('career_mentor_user');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const token = res.data.token;
      if (token) {
        localStorage.setItem('career_mentor_token', token);
      }
      if (res.data.user) {
        localStorage.setItem('career_mentor_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
      }
      await checkAuth(); // Load full profile
      return res.data;
    }
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data.success) {
      const token = res.data.token;
      if (token) {
        localStorage.setItem('career_mentor_token', token);
      }
      if (res.data.user) {
        localStorage.setItem('career_mentor_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
      }
      await checkAuth();
      return res.data;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('career_mentor_token');
      localStorage.removeItem('career_mentor_user');
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    const res = await api.put('/profile', profileData);
    if (res.data.success) {
      await checkAuth();
      return res.data;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser: checkAuth,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
