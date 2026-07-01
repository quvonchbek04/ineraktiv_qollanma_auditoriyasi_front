import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import { useAuth } from './context/AuthContext';
import { settingsApi, API_URL } from './api/client';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Library from './pages/Library';
import Blog from './pages/Blog';
import Suggestions from './pages/Suggestions';
import AdminPanel from './pages/AdminPanel';
import BookReader from './pages/BookReader';
import Diary from './pages/Diary';

function SmartHome() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/library" replace /> : <Navigate to="/login" replace />;
}

export default function App() {
  useEffect(() => {
    settingsApi.getBackground().then(({ url }) => {
      if (url) {
        const fullUrl = url.startsWith('http') ? url : `${API_URL.replace('/api', '')}${url}`;
        document.body.style.backgroundImage = `url('${fullUrl}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundAttachment = 'fixed';
        document.body.style.backgroundPosition = 'center';
      } else {
        document.body.style.backgroundImage = '';
      }
    }).catch(() => {});
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<SmartHome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<Home />} />
          <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
          <Route path="/blog" element={<ProtectedRoute><Blog /></ProtectedRoute>} />
          <Route path="/diary" element={<ProtectedRoute><Diary /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/suggestions" element={<ProtectedRoute><Suggestions /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
          <Route path="/book-reader/:id" element={<ProtectedRoute><BookReader /></ProtectedRoute>} />
        </Routes>
      </main>
    </>
  );
}
