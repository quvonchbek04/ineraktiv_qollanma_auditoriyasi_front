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

  // Ro'yxatdan o'tish
  async function register(full_name, password) {
    const data = await authApi.register(full_name, password);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  }

  // Login
  async function login(full_name, password) {
    const data = await authApi.login(full_name, password);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  }

  // Admin login (email + parol)
  async function adminLogin(email, password) {
    const data = await authApi.adminLogin(email, password);
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
    register,
    login,
    adminLogin,
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
