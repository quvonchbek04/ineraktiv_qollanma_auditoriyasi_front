// pages/Suggestions.jsx — Foydalanuvchi taklif yozish sahifasi
// - Yangi taklif yozish formasi
// - O'z takliflarini holati bilan ko'rish (kutilmoqda / ko'rib chiqildi / bajarildi)
// - Admin javobi bo'lsa ko'rsatish

import { useState, useEffect } from 'react';
import { suggestionsApi } from '../api/client';

const STATUS_LABEL = {
  kutilmoqda:     { text: 'Kutilmoqda',      cls: 'status-pending' },
  korib_chiqildi: { text: "Ko'rib chiqildi", cls: 'status-review' },
  bajarildi:      { text: 'Bajarildi',        cls: 'status-done' },
};

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function Suggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sendSuccess, setSendSuccess] = useState('');

  useEffect(() => {
    loadMine();
  }, []);

  async function loadMine() {
    setLoading(true);
    setError('');
    try {
      const data = await suggestionsApi.getMine();
      setSuggestions(data.suggestions || []);
    } catch {
      setError('Takliflarni yuklashda xatolik.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!message.trim()) {
      setSendError('Taklif matni bo\'sh bo\'lishi mumkin emas.');
      return;
    }
    setSending(true);
    setSendError('');
    setSendSuccess('');
    try {
      await suggestionsApi.create(message.trim());
      setMessage('');
      setSendSuccess('Taklifingiz yuborildi! Admin ko\'rib chiqadi.');
      loadMine();
    } catch (err) {
      setSendError(err.message || 'Yuborishda xatolik.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="page-container">
      <h1 className="section-title" style={{ fontSize: '1.6rem', marginBottom: 8 }}>
        Taklif yozish
      </h1>
      <p style={{ color: '#666', marginBottom: 28 }}>
        Qanday kontent qo'shilishini istaysiz? Adminga taklif yuboring.
      </p>

      {/* ===== YANGI TAKLIF FORMASI ===== */}
      <div className="upload-box">
        <h3>Yangi taklif</h3>
        {sendError && <div className="auth-error">{sendError}</div>}
        {sendSuccess && <div className="success-banner">{sendSuccess}</div>}
        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label>Taklifingiz</label>
            <textarea
              placeholder="Masalan: «Algoritmlar bo'yicha audio kitob qo'shing» yoki «Python video kursi kerak»..."
              value={message}
              onChange={(e) => { setMessage(e.target.value); setSendError(''); setSendSuccess(''); }}
              rows={4}
              disabled={sending}
            />
          </div>
          <div>
            <button type="submit" className="btn-primary" disabled={sending}>
              {sending ? 'Yuborilmoqda...' : 'Taklif yuborish'}
            </button>
          </div>
        </form>
      </div>

      {/* ===== MENING TAKLIFLARIM ===== */}
      <h2 className="section-title">Mening takliflarim</h2>

      {loading && <p className="page-loading">Yuklanmoqda...</p>}
      {error && <div className="auth-error">{error}</div>}

      {!loading && suggestions.length === 0 && (
        <p className="empty-msg">Siz hali taklif yubormadingiz.</p>
      )}

      <div className="suggestions-list">
        {suggestions.map((s) => {
          const st = STATUS_LABEL[s.status] || { text: s.status, cls: '' };
          return (
            <div key={s.id} className="suggestion-card">
              <div className="suggestion-card-top">
                <span className={`status-badge ${st.cls}`}>{st.text}</span>
                <span className="blog-date">{formatDate(s.created_at)}</span>
              </div>
              <p className="suggestion-msg">{s.message}</p>
              {s.admin_reply && (
                <div className="admin-reply-box">
                  <span className="admin-reply-label">Admin javobi:</span>
                  <p>{s.admin_reply}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
