import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('voucher_portal_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
          }
        } catch (err) {
          console.error('Failed to authenticate stored token:', err);
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('voucher_portal_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data.user;
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Check your credentials.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const register = async (name, email, password, role) => {
    setError(null);
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      if (res.data.success) {
        localStorage.setItem('voucher_portal_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data.user;
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem('voucher_portal_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
