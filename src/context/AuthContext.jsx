// context/AuthContext.jsx — Foydalanuvchi login holatini saqlash

import { createContext, useContext, useState, useEffect } from 'react';
import { authApi, usersApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }

    usersApi.getMe()
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  // Faqat ism bilan kirish
  async function enter(full_name) {
    const data = await authApi.enter(full_name);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  function updateUserState(newUserData) {
    setUser((prev) => ({ ...prev, ...newUserData }));
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: !!user?.is_admin,
    enter,
    logout,
    updateUserState
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth faqat AuthProvider ichida ishlatilishi kerak.');
  return context;
}
