// components/Navbar.jsx — Navigatsiya paneli

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate('/');
  }

  function isActive(path) {
    return location.pathname === path ? { fontWeight: 700, color: '#111' } : {};
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          O'quv <span>Platforma</span>
        </Link>

        <div className="navbar-links">
          {isAuthenticated && (
            <>
              <Link to="/library" style={isActive('/library')}>Kutubxona</Link>
              <Link to="/blog" style={isActive('/blog')}>Blog</Link>
              <Link to="/suggestions" style={isActive('/suggestions')}>Taklif</Link>
            </>
          )}
          {isAdmin && (
            <Link to="/admin" className="navbar-admin-link">⚙ Admin</Link>
          )}

          {isAuthenticated ? (
            <div className="navbar-user">
              <Link to="/profile" style={isActive('/profile')}>
                {user.full_name.split(' ')[0]}
              </Link>
              <button onClick={handleLogout} className="navbar-logout-btn">
                Chiqish
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" style={isActive('/login')}>Kirish</Link>
              <Link to="/register" className="navbar-cta">Ro'yxatdan o'tish</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
