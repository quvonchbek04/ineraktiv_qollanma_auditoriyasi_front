// pages/Login.jsx — Login sahifasi (ism + parol)

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, adminLogin } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('user'); // 'user' | 'admin'
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  function switchMode(m) {
    setMode(m);
    setForm({ full_name: '', email: '', password: '' });
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'admin') {
        if (!form.email.trim() || !form.password) {
          setError('Email va parol kiritilishi shart.');
          setLoading(false);
          return;
        }
        await adminLogin(form.email.trim(), form.password);
      } else {
        if (!form.full_name.trim() || !form.password) {
          setError('Ism va parol kiritilishi shart.');
          setLoading(false);
          return;
        }
        await login(form.full_name.trim(), form.password);
      }
      navigate('/library');
    } catch (err) {
      setError(err.message || 'Kirishda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Kirish</h1>
        <p className="auth-subtitle">Akkauntingizga kiring</p>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <button
            type="button"
            onClick={() => switchMode('user')}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 'var(--radius-md)',
              border: '2px solid', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
              borderColor: mode === 'user' ? 'var(--blue-600)' : 'var(--gray-200)',
              background: mode === 'user' ? 'var(--blue-600)' : 'transparent',
              color: mode === 'user' ? '#fff' : 'var(--gray-500)',
              transition: 'var(--transition)'
            }}
          >
            Foydalanuvchi
          </button>
          <button
            type="button"
            onClick={() => switchMode('admin')}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 'var(--radius-md)',
              border: '2px solid', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
              borderColor: mode === 'admin' ? 'var(--blue-600)' : 'var(--gray-200)',
              background: mode === 'admin' ? 'var(--blue-600)' : 'transparent',
              color: mode === 'admin' ? '#fff' : 'var(--gray-500)',
              transition: 'var(--transition)'
            }}
          >
            ⚙ Admin
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'user' ? (
            <div className="form-group">
              <label>Ismingiz</label>
              <input
                type="text"
                name="full_name"
                placeholder="Ro'yxatdan o'tgan ismingiz"
                value={form.full_name}
                onChange={handleChange}
                disabled={loading}
                autoFocus
              />
            </div>
          ) : (
            <div className="form-group">
              <label>Admin email</label>
              <input
                type="email"
                name="email"
                placeholder="admin@email.com"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
                autoFocus
              />
            </div>
          )}

          <div className="form-group">
            <label>Parol</label>
            <input
              type="password"
              name="password"
              placeholder="Parolingiz"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Kirilmoqda...' : 'Kirish →'}
          </button>
        </form>

        {mode === 'user' && (
          <p className="auth-hint">
            Akkauntingiz yo'qmi?{' '}
            <Link to="/register" style={{ color: 'var(--blue-600)', fontWeight: 600 }}>
              Ro'yxatdan o'tish
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
