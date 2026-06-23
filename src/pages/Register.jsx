// pages/Register.jsx — Ro'yxatdan o'tish sahifasi

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ full_name: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.full_name.trim()) { setError('Ism kiritilishi shart.'); return; }
    if (form.password.length < 6) { setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak.'); return; }
    if (form.password !== form.confirm) { setError('Parollar mos kelmadi.'); return; }

    setLoading(true);
    setError('');
    try {
      await register(form.full_name.trim(), form.password);
      navigate('/library');
    } catch (err) {
      setError(err.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Ro'yxatdan o'tish</h1>
        <p className="auth-subtitle">Yangi akkaunt yaratish</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Ismingiz</label>
            <input
              type="text"
              name="full_name"
              placeholder="Masalan: Jasur Karimov"
              value={form.full_name}
              onChange={handleChange}
              disabled={loading}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Parol</label>
            <input
              type="password"
              name="password"
              placeholder="Kamida 6 ta belgi"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>Parolni tasdiqlang</label>
            <input
              type="password"
              name="confirm"
              placeholder="Parolni qayta kiriting"
              value={form.confirm}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="btn-primary btn-full"
            disabled={loading || !form.full_name.trim() || !form.password || !form.confirm}
          >
            {loading ? 'Ro\'yxatdan o\'tilmoqda...' : 'Ro\'yxatdan o\'tish →'}
          </button>
        </form>

        <p className="auth-hint">
          Akkauntingiz bormi?{' '}
          <Link to="/login" style={{ color: 'var(--blue-600)', fontWeight: 600 }}>
            Kirish
          </Link>
        </p>
      </div>
    </div>
  );
}
