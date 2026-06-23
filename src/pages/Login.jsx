// pages/Login.jsx — Kirish sahifasi (ism + parol)

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.full_name.trim() || !form.password) {
      setError('Ism va parol kiritilishi shart.');
      return;
    }
    setLoading(true);
    try {
      await login(form.full_name.trim(), form.password);
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
        <h1 className="auth-title">O'quv Platforma</h1>
        <p className="auth-subtitle">Akkauntingizga kiring</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Ismingiz</label>
            <input
              type="text"
              name="full_name"
              placeholder="Ismingizni kiriting"
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
              placeholder="Parolingizni kiriting"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="btn-primary btn-full"
            disabled={loading || !form.full_name.trim() || !form.password}
          >
            {loading ? 'Kirilmoqda...' : 'Kirish →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: '#666' }}>
          Akkauntingiz yo'qmi?{' '}
          <Link to="/register" style={{ color: '#4f46e5', fontWeight: 600 }}>Ro'yxatdan o'ting</Link>
        </p>
      </div>
    </div>
  );
}
