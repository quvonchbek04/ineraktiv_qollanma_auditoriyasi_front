// pages/Enter.jsx — Faqat ism bilan kirish sahifasi

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Enter() {
  const { enter } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { setError('Ism kiritilishi shart.'); return; }
    setLoading(true);
    setError('');
    try {
      await enter(name.trim());
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
        <h1 className="auth-title">O'quv Platformasi</h1>
        <p className="auth-subtitle">Davom etish uchun ismingizni kiriting</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Ismingiz</label>
            <input
              type="text"
              placeholder="Masalan: Jasur yoki Malika"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              disabled={loading}
              autoFocus
            />
          </div>
          <button type="submit" className="btn-primary btn-full" disabled={loading || !name.trim()}>
            {loading ? 'Kirish...' : 'Kirish →'}
          </button>
        </form>

        <p className="auth-hint">
          Birinchi marta kirsangiz — akkaunt avtomatik yaratiladi.<br />
          Qayta kirsangiz — avvalgi akkauntingiz topiladi.
        </p>
      </div>
    </div>
  );
}
