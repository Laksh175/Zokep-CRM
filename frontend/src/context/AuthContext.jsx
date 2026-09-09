import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('zokep_token') || null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user profile on initial app load with 0ms instant cache hydration
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('zokep_token');
      const savedUser = localStorage.getItem('zokep_user');
      const savedSub = localStorage.getItem('zokep_sub');

      // 1. Instant 0ms Cache Hydration
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          if (savedSub) setSubscription(JSON.parse(savedSub));
          setLoading(false); // 0ms instant load!
        } catch (e) {
          console.warn('Cache parse error:', e);
        }
      }

      // 2. Background Revalidation API Call
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.success) {
            setUser(res.user);
            setSubscription(res.subscription);
            localStorage.setItem('zokep_user', JSON.stringify(res.user));
            if (res.subscription) localStorage.setItem('zokep_sub', JSON.stringify(res.subscription));
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
      localStorage.setItem('zokep_user', JSON.stringify(res.user));
      if (res.subscription) localStorage.setItem('zokep_sub', JSON.stringify(res.subscription));
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
      localStorage.setItem('zokep_user', JSON.stringify(res.user));
      if (res.subscription) localStorage.setItem('zokep_sub', JSON.stringify(res.subscription));
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
        localStorage.setItem('zokep_user', JSON.stringify(res.user));
        if (res.subscription) localStorage.setItem('zokep_sub', JSON.stringify(res.subscription));
      }
    } catch (err) {
      console.warn('Failed to refresh user profile:', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('zokep_token');
    localStorage.removeItem('zokep_user');
    localStorage.removeItem('zokep_sub');
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
