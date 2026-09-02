'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiFetch } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = logged out
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const data = await apiFetch('/api/auth/me');
      setUser(data.user);
    } catch (e) {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial session check on mount
    refresh();
  }, [refresh]);

  async function login(email, password) {
    setError(null);
    const data = await apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout, refresh, error }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
