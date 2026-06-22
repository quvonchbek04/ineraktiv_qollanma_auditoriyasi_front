// components/AdminRoute.jsx — Faqat admin kira oladigan sahifalar uchun (masalan: Admin Panel)
// Login qilmagan bo'lsa /login'ga, admin bo'lmagan bo'lsa bosh sahifaga yo'naltiradi

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="page-loading">Yuklanmoqda...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
