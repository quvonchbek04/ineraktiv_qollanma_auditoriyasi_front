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

  async function login(full_name, password) {
    const data = await authApi.login(full_name, password);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  function updateUserState(newData) {
    setUser((prev) => ({ ...prev, ...newData }));
  }

  return (
    <AuthContext.Provider value={{
      user, loading,
      isAuthenticated: !!user,
      isAdmin: !!user?.is_admin,
      login, logout, updateUserState
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth faqat AuthProvider ichida ishlatilishi kerak.');
  return ctx;
}
