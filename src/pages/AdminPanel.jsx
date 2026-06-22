// pages/AdminPanel.jsx — Admin boshqaruv paneli
// - Barcha foydalanuvchi takliflarini ko'rish, holat va javob o'rnatish
// - YouTube link qo'shish (video yoki audio)
// - Filter: holat bo'yicha

import { useState, useEffect } from 'react';
import { suggestionsApi, contentApi } from '../api/client';

const STATUS_LABEL = {
  kutilmoqda:     { text: 'Kutilmoqda',      cls: 'status-pending' },
  korib_chiqildi: { text: "Ko'rib chiqildi", cls: 'status-review' },
  bajarildi:      { text: 'Bajarildi',        cls: 'status-done' },
};

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function AdminPanel() {
  // ===== TAKLIFLAR =====
  const [suggestions, setSuggestions] = useState([]);
  const [sugLoading, setSugLoading] = useState(true);
  const [sugError, setSugError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Taklif tahrirlash
  const [editId, setEditId] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editReply, setEditReply] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // ===== YOUTUBE QO'SHISH =====
  const [ytForm, setYtForm] = useState({ type: 'video', title: '', description: '', youtube_url: '' });
  const [ytLoading, setYtLoading] = useState(false);
  const [ytError, setYtError] = useState('');
  const [ytSuccess, setYtSuccess] = useState('');

  // ===== AKTIV TAB =====
  const [tab, setTab] = useState('suggestions'); // 'suggestions' | 'youtube'

  useEffect(() => {
    loadSuggestions();
  }, [statusFilter]);

  async function loadSuggestions() {
    setSugLoading(true);
    setSugError('');
    try {
      const data = await suggestionsApi.getAll(statusFilter);
      setSuggestions(data.suggestions || []);
    } catch {
      setSugError('Takliflarni yuklashda xatolik.');
    } finally {
      setSugLoading(false);
    }
  }

  function openEdit(s) {
    setEditId(s.id);
    setEditStatus(s.status);
    setEditReply(s.admin_reply || '');
    setEditError('');
  }

  function closeEdit() {
    setEditId(null);
    setEditError('');
  }

  async function handleEditSave(id) {
    setEditLoading(true);
    setEditError('');
    try {
      await suggestionsApi.update(id, { status: editStatus, admin_reply: editReply });
      closeEdit();
      loadSuggestions();
    } catch (err) {
      setEditError(err.message || 'Saqlashda xatolik.');
    } finally {
      setEditLoading(false);
    }
  }

  async function handleAddYoutube(e) {
    e.preventDefault();
    if (!ytForm.title.trim() || !ytForm.youtube_url.trim()) {
      setYtError('Sarlavha va YouTube link kiritilishi shart.');
      return;
    }
    setYtLoading(true);
    setYtError('');
    setYtSuccess('');
    try {
      await contentApi.addYoutube({
        type: ytForm.type,
        title: ytForm.title.trim(),
        description: ytForm.description.trim(),
        youtube_url: ytForm.youtube_url.trim(),
      });
      setYtSuccess('YouTube kontent muvaffaqiyatli qo\'shildi!');
      setYtForm({ type: 'video', title: '', description: '', youtube_url: '' });
    } catch (err) {
      setYtError(err.message || 'Xatolik yuz berdi.');
    } finally {
      setYtLoading(false);
    }
  }

  const filterOptions = [
    { value: '', label: 'Barchasi' },
    { value: 'kutilmoqda', label: 'Kutilmoqda' },
    { value: 'korib_chiqildi', label: "Ko'rib chiqildi" },
    { value: 'bajarildi', label: 'Bajarildi' },
  ];

  return (
    <div className="page-container">
      <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 24 }}>
        🛠 Admin Panel
      </h1>

      {/* ===== TAB TUGMALARI ===== */}
      <div className="filter-tabs" style={{ marginBottom: 28 }}>
        <button
          className={`filter-tab ${tab === 'suggestions' ? 'active' : ''}`}
          onClick={() => setTab('suggestions')}
        >
          💬 Takliflar
        </button>
        <button
          className={`filter-tab ${tab === 'youtube' ? 'active' : ''}`}
          onClick={() => setTab('youtube')}
        >
          ▶ YouTube kontent qo'shish
        </button>
      </div>

      {/* ===== TAKLIFLAR TABI ===== */}
      {tab === 'suggestions' && (
        <>
          {/* Holat filtri */}
          <div className="filter-tabs" style={{ marginBottom: 20 }}>
            {filterOptions.map((f) => (
              <button
                key={f.value}
                className={`filter-tab ${statusFilter === f.value ? 'active' : ''}`}
                onClick={() => setStatusFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {sugLoading && <p className="page-loading">Yuklanmoqda...</p>}
          {sugError && <div className="auth-error">{sugError}</div>}
          {!sugLoading && suggestions.length === 0 && (
            <p className="empty-msg">Bu holatda takliflar topilmadi.</p>
          )}

          <div className="suggestions-list">
            {suggestions.map((s) => {
              const st = STATUS_LABEL[s.status] || { text: s.status, cls: '' };
              const isEditing = editId === s.id;

              return (
                <div key={s.id} className="suggestion-card admin-suggestion-card">
                  <div className="suggestion-card-top">
                    <span className={`status-badge ${st.cls}`}>{st.text}</span>
                    <span className="blog-date">{formatDate(s.created_at)}</span>
                  </div>

                  <div className="admin-sug-author">
                    <strong>{s.author_name}</strong>
                    <span className="blog-date"> — {s.author_email}</span>
                  </div>

                  <p className="suggestion-msg">{s.message}</p>

                  {s.admin_reply && !isEditing && (
                    <div className="admin-reply-box">
                      <span className="admin-reply-label">Sizning javobingiz:</span>
                      <p>{s.admin_reply}</p>
                    </div>
                  )}

                  {/* Tahrirlash formasi */}
                  {isEditing ? (
                    <div className="admin-edit-form">
                      {editError && <div className="auth-error" style={{ marginBottom: 10 }}>{editError}</div>}

                      <div className="form-group">
                        <label>Holat</label>
                        <select
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                          disabled={editLoading}
                        >
                          <option value="kutilmoqda">Kutilmoqda</option>
                          <option value="korib_chiqildi">Ko'rib chiqildi</option>
                          <option value="bajarildi">Bajarildi</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Javob (ixtiyoriy)</label>
                        <textarea
                          value={editReply}
                          onChange={(e) => setEditReply(e.target.value)}
                          rows={3}
                          placeholder="Foydalanuvchiga javob yozing..."
                          disabled={editLoading}
                        />
                      </div>

                      <div className="profile-edit-actions">
                        <button
                          className="btn-primary"
                          onClick={() => handleEditSave(s.id)}
                          disabled={editLoading}
                        >
                          {editLoading ? 'Saqlanmoqda...' : 'Saqlash'}
                        </button>
                        <button className="btn-secondary" onClick={closeEdit} disabled={editLoading}>
                          Bekor qilish
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button className="btn-secondary" style={{ marginTop: 10, alignSelf: 'flex-start' }} onClick={() => openEdit(s)}>
                      Javob berish / Holatni o'zgartirish
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ===== YOUTUBE TABI ===== */}
      {tab === 'youtube' && (
        <div className="upload-box">
          <h3>YouTube kontent qo'shish</h3>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: 20 }}>
            Video yoki audio kontentni serverga yuklamasdan, YouTube link orqali saytga qo'shing.
            Foydalanuvchilar uni kutubxonada to'g'ridan-to'g'ri ko'radi.
          </p>

          {ytError && <div className="auth-error">{ytError}</div>}
          {ytSuccess && <div className="success-banner">{ytSuccess}</div>}

          <form onSubmit={handleAddYoutube} className="upload-form">
            <div className="form-group">
              <label>Kontent turi</label>
              <select
                value={ytForm.type}
                onChange={(e) => setYtForm((p) => ({ ...p, type: e.target.value }))}
                disabled={ytLoading}
              >
                <option value="video">🎬 Video</option>
                <option value="audio">🎧 Audio</option>
              </select>
            </div>

            <div className="form-group">
              <label>Sarlavha</label>
              <input
                placeholder="Kontent sarlavhasi"
                value={ytForm.title}
                onChange={(e) => { setYtForm((p) => ({ ...p, title: e.target.value })); setYtError(''); setYtSuccess(''); }}
                disabled={ytLoading}
              />
            </div>

            <div className="form-group">
              <label>Tavsif (ixtiyoriy)</label>
              <textarea
                placeholder="Qisqacha tavsif..."
                value={ytForm.description}
                onChange={(e) => setYtForm((p) => ({ ...p, description: e.target.value }))}
                rows={2}
                disabled={ytLoading}
              />
            </div>

            <div className="form-group">
              <label>YouTube link</label>
              <input
                placeholder="https://www.youtube.com/watch?v=..."
                value={ytForm.youtube_url}
                onChange={(e) => { setYtForm((p) => ({ ...p, youtube_url: e.target.value })); setYtError(''); setYtSuccess(''); }}
                disabled={ytLoading}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={ytLoading}>
              {ytLoading ? 'Qo\'shilmoqda...' : '+ Kutubxonaga qo\'shish'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
