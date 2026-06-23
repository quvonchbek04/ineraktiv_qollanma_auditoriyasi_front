// pages/Diary.jsx — Kundalik / Shaxsiy yozuvlar

import { useState, useEffect } from 'react';
import { diaryApi } from '../api/client';

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function Diary() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Yangi yozuv
  const [form, setForm] = useState({ title: '', body: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Tahrirlash
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', body: '' });
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => { loadEntries(); }, []);

  async function loadEntries() {
    setLoading(true);
    try {
      const data = await diaryApi.getAll();
      setEntries(data.entries || []);
    } catch { setError('Yozuvlarni yuklashda xatolik.'); }
    finally { setLoading(false); }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.title.trim()) { setSaveError('Sarlavha kiritilishi shart.'); return; }
    setSaving(true); setSaveError('');
    try {
      await diaryApi.create(form.title.trim(), form.body.trim());
      setForm({ title: '', body: '' });
      setShowForm(false);
      loadEntries();
    } catch (err) { setSaveError(err.message || 'Saqlashda xatolik.'); }
    finally { setSaving(false); }
  }

  function openEdit(entry) {
    setEditId(entry.id);
    setEditForm({ title: entry.title, body: entry.body });
  }

  async function handleEdit(e) {
    e.preventDefault();
    setEditSaving(true);
    try {
      await diaryApi.update(editId, editForm);
      setEditId(null);
      loadEntries();
    } catch (err) { alert(err.message || 'Xatolik.'); }
    finally { setEditSaving(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Bu yozuvni o\'chirishni tasdiqlaysizmi?')) return;
    try {
      await diaryApi.remove(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) { alert(err.message || 'Xatolik.'); }
  }

  return (
    <div className="page-container">
      <div className="library-header">
        <h1>📔 Kundalik</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Yopish' : '+ Yangi yozuv'}
        </button>
      </div>
      <p style={{ color: '#666', marginBottom: 24 }}>
        Bu sahifa faqat siz uchun — boshqalar sizning yozuvlaringizni ko'ra olmaydi.
      </p>

      {/* Yangi yozuv formasi */}
      {showForm && (
        <div className="upload-box">
          <h3>Yangi yozuv</h3>
          {saveError && <div className="auth-error">{saveError}</div>}
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label>Sarlavha</label>
              <input
                placeholder="Yozuv sarlavhasi..."
                value={form.title}
                onChange={(e) => { setForm((p) => ({ ...p, title: e.target.value })); setSaveError(''); }}
                disabled={saving}
              />
            </div>
            <div className="form-group">
              <label>Matn</label>
              <textarea
                placeholder="Bugun nima bo'ldi? Fikrlaringiz, rejalaringiz..."
                value={form.body}
                onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
                rows={5}
                disabled={saving}
              />
            </div>
            <div>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && <p className="page-loading">Yuklanmoqda...</p>}
      {error && <div className="auth-error">{error}</div>}
      {!loading && entries.length === 0 && (
        <p className="empty-msg">Hali yozuv yo'q. Birinchi yozuvingizni qo'shing!</p>
      )}

      <div className="suggestions-list">
        {entries.map((entry) => (
          <div key={entry.id} className="suggestion-card">
            {editId === entry.id ? (
              <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="form-group">
                  <label>Sarlavha</label>
                  <input
                    value={editForm.title}
                    onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                    disabled={editSaving}
                  />
                </div>
                <div className="form-group">
                  <label>Matn</label>
                  <textarea
                    value={editForm.body}
                    onChange={(e) => setEditForm((p) => ({ ...p, body: e.target.value }))}
                    rows={4}
                    disabled={editSaving}
                  />
                </div>
                <div className="profile-edit-actions">
                  <button type="submit" className="btn-primary" disabled={editSaving}>
                    {editSaving ? 'Saqlanmoqda...' : 'Saqlash'}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setEditId(null)}>
                    Bekor
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="suggestion-card-top">
                  <strong style={{ fontSize: '1.05rem' }}>{entry.title}</strong>
                  <span className="blog-date">{formatDate(entry.created_at)}</span>
                </div>
                {entry.body && <p className="suggestion-msg" style={{ whiteSpace: 'pre-wrap' }}>{entry.body}</p>}
                <div className="profile-edit-actions" style={{ marginTop: 12 }}>
                  <button className="btn-secondary" onClick={() => openEdit(entry)}>Tahrirlash</button>
                  <button className="btn-danger" onClick={() => handleDelete(entry.id)}>O'chirish</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
