// App.jsx — Asosiy ilova: barcha sahifalarni routing orqali birlashtiradi

import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import { useAuth } from './context/AuthContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Library from './pages/Library';
import Blog from './pages/Blog';
import Suggestions from './pages/Suggestions';
import AdminPanel from './pages/AdminPanel';
import BookReader from './pages/BookReader';

// Root sahifa: login qilingan → /library, qilinmagan → /register
function SmartHome() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/library" replace /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<SmartHome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />

          {/* Library va Blog faqat login qilinganlar uchun */}
          <Route path="/library" element={
            <ProtectedRoute><Library /></ProtectedRoute>
          } />
          <Route path="/blog" element={
            <ProtectedRoute><Blog /></ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
          <Route path="/suggestions" element={
            <ProtectedRoute><Suggestions /></ProtectedRoute>
          } />

          <Route path="/admin" element={
            <AdminRoute><AdminPanel /></AdminRoute>
          } />

          <Route path="/book-reader/:id" element={
            <ProtectedRoute><BookReader /></ProtectedRoute>
          } />
        </Routes>
      </main>
    </>
  );
}
