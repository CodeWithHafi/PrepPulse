// context/AuthContext.jsx
// Provides authenticated user state across the entire app

import { createContext, useContext, useState, useEffect } from 'react';
import { getToken, clearAuth } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); // checking stored session

  // Restore session on mount
  useEffect(() => {
    const token   = getToken();
    const stored  = localStorage.getItem('pp_user');
    if (token && stored) {
      try { setUser(JSON.parse(stored)); } catch { /* corrupt data */ }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('pp_token', token);
    localStorage.setItem('pp_user',  JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    clearAuth();
    setUser(null);
  };

  const updateUser = (updates) => {
    const merged = { ...user, ...updates };
    localStorage.setItem('pp_user', JSON.stringify(merged));
    setUser(merged);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
