import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() { logout(); navigate('/library'); }
  function isActive(p) { return location.pathname === p ? { fontWeight: 700, color: '#111' } : {}; }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">O'quv <span>Platforma</span></Link>

        <div className="navbar-links">
          {/* Ochiq sahifalar — hamma ko'ra oladi */}
          <Link to="/library" style={isActive('/library')}>Kutubxona</Link>
          <Link to="/blog" style={isActive('/blog')}>Blog</Link>

          {/* Faqat kirgan foydalanuvchilar uchun */}
          {isAuthenticated && (
            <>
              <Link to="/diary" style={isActive('/diary')}>Kundalik</Link>
              <Link to="/suggestions" style={isActive('/suggestions')}>Taklif</Link>
            </>
          )}

          {/* Faqat admin uchun */}
          {isAdmin && (
            <Link to="/admin" className="navbar-admin-link">⚙ Admin</Link>
          )}

          {isAuthenticated ? (
            <div className="navbar-user">
              <Link to="/profile" style={isActive('/profile')}>
                {user.full_name.split(' ')[0]}
              </Link>
              <button onClick={handleLogout} className="navbar-logout-btn">Chiqish</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Link to="/login" style={{ ...isActive('/login'), fontSize: '14px' }}>Kirish</Link>
              <Link to="/register" className="navbar-cta">Ro'yxatdan o'tish</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
