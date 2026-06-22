// pages/Register.jsx — Ro'yxatdan o'tish sahifasi

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.full_name || !form.email || !form.password || !form.confirm) {
      setError('Barcha maydonlarni to\'ldiring.');
      return;
    }
    if (form.password.length < 6) {
      setError('Parol kamida 6 ta belgidan iborat bo\'lishi kerak.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Parollar mos emas.');
      return;
    }

    setLoading(true);
    try {
      await register(form.full_name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      <div className="auth-box">
        <h1 className="auth-title">Ro'yxatdan o'tish</h1>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="full_name">To'liq ism</label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              placeholder="Ism Familiya"
              value={form.full_name}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="misol@email.com"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Parol</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Kamida 6 ta belgi"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm">Parolni tasdiqlang</label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              placeholder="Parolni qayta kiriting"
              value={form.confirm}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Ro\'yxatdan o\'tilmoqda...' : 'Ro\'yxatdan o\'tish'}
          </button>
        </form>

        <p className="auth-footer">
          Allaqachon akkauntingiz bormi?{' '}
          <Link to="/login">Kirish</Link>
        </p>
      </div>
    </div>
  );
}
