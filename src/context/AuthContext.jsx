// context/AuthContext.jsx — Foydalanuvchi login holatini butun ilova bo'ylab saqlash
// useAuth() hook orqali har qanday komponentda foydalanuvchi ma'lumotiga kirish mumkin

import { createContext, useContext, useState, useEffect } from 'react';
import { authApi, usersApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sahifa yangilanganda, agar token bo'lsa, foydalanuvchi ma'lumotini qayta yuklaymiz
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    usersApi.getMe()
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem('token'); // Token yaroqsiz bo'lsa, tozalaymiz
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const data = await authApi.login(email, password);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(full_name, email, password) {
    const data = await authApi.register(full_name, email, password);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  // Profil yangilanganda (masalan bio o'zgartirilganda) user holatini ham yangilash uchun
  function updateUserState(newUserData) {
    setUser((prev) => ({ ...prev, ...newUserData }));
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: !!user?.is_admin,
    login,
    register,
    logout,
    updateUserState
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth faqat AuthProvider ichida ishlatilishi kerak.');
  }
  return context;
}
