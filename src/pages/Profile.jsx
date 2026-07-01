// pages/Profile.jsx — Foydalanuvchi profili sahifasi
// - Profil ma'lumotlarini ko'rish va tahrirlash (ism, bio, avatar URL)
// - O'z yuklagan kontentlarini ko'rish va o'chirish

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersApi, contentApi } from '../api/client';

export default function Profile() {
  const { user, updateUserState } = useAuth();

  // ===== PROFIL TAHRIRLASH =====
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ full_name: '', bio: '', avatar_url: '' });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  // ===== MENING KONTENTLARIM =====
  const [myContent, setMyContent] = useState([]);
  const [contentLoading, setContentLoading] = useState(true);
  const [contentError, setContentError] = useState('');

  // Profil forma boshlang'ich qiymatlarini o'rnatish
  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        bio: user.bio || '',
        avatar_url: user.avatar_url || ''
      });
    }
  }, [user]);

  // Mening kontentlarimni yuklash — faqat admin uchun kerak
  useEffect(() => {
    if (!user || user.is_admin !== 1) { setContentLoading(false); return; }
    contentApi.getMine()
      .then((data) => setMyContent(data.content || []))
      .catch(() => setContentError('Kontentlarni yuklashda xatolik.'))
      .finally(() => setContentLoading(false));
  }, [user]);

  function handleFormChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSaveError('');
    setSaveSuccess('');
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.full_name.trim()) {
      setSaveError('Ism bo\'sh bo\'lishi mumkin emas.');
      return;
    }
    setSaveLoading(true);
    setSaveError('');
    setSaveSuccess('');
    try {
      const data = await usersApi.updateMe({
        full_name: form.full_name.trim(),
        bio: form.bio.trim(),
        avatar_url: form.avatar_url.trim()
      });
      updateUserState(data.user);
      setSaveSuccess('Profil muvaffaqiyatli yangilandi!');
      setEditMode(false);
    } catch (err) {
      setSaveError(err.message || 'Saqlashda xatolik.');
    } finally {
      setSaveLoading(false);
    }
  }

  async function handleDeleteContent(id) {
    if (!window.confirm('Bu kontentni o\'chirishni tasdiqlaysizmi?')) return;
    try {
      await contentApi.remove(id);
      setMyContent((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err.message || 'O\'chirishda xatolik.');
    }
  }

  const typeLabel = { book: '📚 Kitob', video: '🎬 Video', audio: '🎧 Audio' };

  if (!user) return <div className="page-loading">Yuklanmoqda...</div>;

  return (
    <div className="page-container">

      {/* ===== PROFIL KARTASI ===== */}
      <div className="profile-card">
        <div className="profile-avatar">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.full_name} />
          ) : (
            <div className="profile-avatar-placeholder">
              {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
        </div>

        {!editMode ? (
          <div className="profile-info">
            <h1 className="profile-name">{user.full_name}</h1>
            <p className="profile-email">{user.email}</p>
            {user.bio && <p className="profile-bio">{user.bio}</p>}
            {user.is_admin === 1 && (
              <span className="badge-admin">Admin</span>
            )}
            {saveSuccess && <p className="success-msg">{saveSuccess}</p>}
            <button className="btn-secondary" onClick={() => setEditMode(true)}>
              Profilni tahrirlash
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="profile-edit-form">
            <h2>Profilni tahrirlash</h2>

            {saveError && <div className="auth-error">{saveError}</div>}

            <div className="form-group">
              <label>To'liq ism</label>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleFormChange}
                disabled={saveLoading}
              />
            </div>
            <div className="form-group">
              <label>Bio (o'zingiz haqingizda)</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleFormChange}
                rows={3}
                placeholder="Qisqacha o'zingiz haqingizda..."
                disabled={saveLoading}
              />
            </div>
            <div className="form-group">
              <label>Avatar URL (rasm linki)</label>
              <input
                name="avatar_url"
                value={form.avatar_url}
                onChange={handleFormChange}
                placeholder="https://..."
                disabled={saveLoading}
              />
            </div>

            <div className="profile-edit-actions">
              <button type="submit" className="btn-primary" disabled={saveLoading}>
                {saveLoading ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => { setEditMode(false); setSaveError(''); }}
                disabled={saveLoading}
              >
                Bekor qilish
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ===== MENING KONTENTLARIM — faqat admin uchun ===== */}
      {user.is_admin === 1 && (
      <div className="section">
        <h2 className="section-title">Mening kontentlarim</h2>

        {contentLoading && <p className="page-loading">Yuklanmoqda...</p>}
        {contentError && <div className="auth-error">{contentError}</div>}

        {!contentLoading && myContent.length === 0 && (
          <p className="empty-msg">Siz hali hech narsa yuklamagansiz.</p>
        )}

        {myContent.length > 0 && (
          <div className="content-list">
            {myContent.map((item) => (
              <div key={item.id} className="content-item">
                <div className="content-item-info">
                  <span className="content-type-badge">{typeLabel[item.type] || item.type}</span>
                  {item.content_source === 'youtube' && (
                    <span className="content-yt-badge">YouTube</span>
                  )}
                  <strong>{item.title}</strong>
                  {item.description && <p className="content-desc">{item.description}</p>}
                </div>
                <button
                  className="btn-danger"
                  onClick={() => handleDeleteContent(item.id)}
                >
                  O'chirish
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

    </div>
  );
}
