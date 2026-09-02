import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('zokep_token') || null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user profile on initial app load if token exists in localStorage
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('zokep_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.success) {
            setUser(res.user);
            setSubscription(res.subscription);
          }
        } catch (err) {
          console.warn('Session expired or invalid:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success) {
      localStorage.setItem('zokep_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setSubscription(res.subscription);
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const registerAdmin = async (registrationData) => {
    const res = await api.post('/auth/register-admin', registrationData);
    if (res.success) {
      localStorage.setItem('zokep_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setSubscription(res.subscription);
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const refreshMe = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.success) {
        setUser(res.user);
        setSubscription(res.subscription);
      }
    } catch (err) {
      console.warn('Failed to refresh user profile:', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('zokep_token');
    setToken(null);
    setUser(null);
    setSubscription(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        subscription,
        loading,
        login,
        registerAdmin,
        refreshMe,
        logout,
        isAuthenticated: !!user,
        isSuperAdmin: user?.role === 'super_admin',
        isAdmin: user?.role === 'admin',
        isStaff: user?.role === 'staff',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
