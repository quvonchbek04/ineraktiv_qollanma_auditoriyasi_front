// pages/AdminPanel.jsx — Admin boshqaruv paneli

import { useState, useEffect } from 'react';
import { suggestionsApi, contentApi, settingsApi, API_URL } from '../api/client';

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
  const [tab, setTab] = useState('suggestions'); // suggestions | upload | youtube | background

  // ===== TAKLIFLAR =====
  const [suggestions, setSuggestions] = useState([]);
  const [sugLoading, setSugLoading] = useState(true);
  const [sugError, setSugError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editId, setEditId] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editReply, setEditReply] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // ===== KONTENT YUKLASH =====
  const [uploadForm, setUploadForm] = useState({ type: 'book', title: '', description: '' });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  // ===== YOUTUBE =====
  const [ytForm, setYtForm] = useState({ type: 'video', title: '', description: '', youtube_url: '' });
  const [ytLoading, setYtLoading] = useState(false);
  const [ytError, setYtError] = useState('');
  const [ytSuccess, setYtSuccess] = useState('');

  // ===== FON RASM =====
  const [bgUrl, setBgUrl] = useState('');
  const [bgFile, setBgFile] = useState(null);
  const [bgLoading, setBgLoading] = useState(false);
  const [bgError, setBgError] = useState('');
  const [bgSuccess, setBgSuccess] = useState('');
  const [currentBg, setCurrentBg] = useState('');

  useEffect(() => {
    loadSuggestions();
    settingsApi.getBackground().then(({ url }) => setCurrentBg(url || '')).catch(() => {});
  }, [statusFilter]);

  async function loadSuggestions() {
    setSugLoading(true); setSugError('');
    try {
      const data = await suggestionsApi.getAll(statusFilter);
      setSuggestions(data.suggestions || []);
    } catch { setSugError('Takliflarni yuklashda xatolik.'); }
    finally { setSugLoading(false); }
  }

  function openEdit(s) { setEditId(s.id); setEditStatus(s.status); setEditReply(s.admin_reply || ''); setEditError(''); }
  function closeEdit() { setEditId(null); setEditError(''); }

  async function handleEditSave(id) {
    setEditLoading(true); setEditError('');
    try { await suggestionsApi.update(id, { status: editStatus, admin_reply: editReply }); closeEdit(); loadSuggestions(); }
    catch (err) { setEditError(err.message || 'Saqlashda xatolik.'); }
    finally { setEditLoading(false); }
  }

  // Kontent yuklash
  async function handleUpload(e) {
    e.preventDefault();
    if (!uploadForm.title.trim()) { setUploadError('Sarlavha kiritilishi shart.'); return; }
    if (!uploadFile) { setUploadError('Fayl tanlanishi shart.'); return; }
    setUploading(true); setUploadError(''); setUploadSuccess('');
    const formData = new FormData();
    formData.append('type', uploadForm.type);
    formData.append('title', uploadForm.title.trim());
    formData.append('description', uploadForm.description.trim());
    formData.append('file', uploadFile);
    try {
      await contentApi.upload(formData);
      setUploadSuccess('Fayl muvaffaqiyatli yuklandi!');
      setUploadForm({ type: 'book', title: '', description: '' });
      setUploadFile(null);
    } catch (err) { setUploadError(err.message || 'Yuklashda xatolik.'); }
    finally { setUploading(false); }
  }

  // YouTube qo'shish
  async function handleAddYoutube(e) {
    e.preventDefault();
    if (!ytForm.title.trim() || !ytForm.youtube_url.trim()) { setYtError('Sarlavha va YouTube link kiritilishi shart.'); return; }
    setYtLoading(true); setYtError(''); setYtSuccess('');
    try {
      await contentApi.addYoutube(ytForm);
      setYtSuccess('YouTube kontent muvaffaqiyatli qo\'shildi!');
      setYtForm({ type: 'video', title: '', description: '', youtube_url: '' });
    } catch (err) { setYtError(err.message || 'Xatolik.'); }
    finally { setYtLoading(false); }
  }

  // Fon rasm — URL orqali
  async function handleBgUrl(e) {
    e.preventDefault();
    setBgLoading(true); setBgError(''); setBgSuccess('');
    try {
      await settingsApi.setBackground(bgUrl);
      setCurrentBg(bgUrl);
      // Darhol sahifaga qo'llash
      if (bgUrl) {
        document.body.style.backgroundImage = `url('${bgUrl}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundAttachment = 'fixed';
        document.body.style.backgroundPosition = 'center';
      } else {
        document.body.style.backgroundImage = '';
      }
      setBgSuccess('Fon rasm muvaffaqiyatli o\'rnatildi!');
    } catch (err) { setBgError(err.message || 'Xatolik.'); }
    finally { setBgLoading(false); }
  }

  // Fon rasm — fayl yuklash
  async function handleBgUpload(e) {
    e.preventDefault();
    if (!bgFile) { setBgError('Fayl tanlanishi shart.'); return; }
    setBgLoading(true); setBgError(''); setBgSuccess('');
    const formData = new FormData();
    formData.append('file', bgFile);
    try {
      const data = await settingsApi.uploadBackground(formData);
      setCurrentBg(data.url);
      const fullUrl = `${API_URL.replace('/api', '')}${data.url}`;
      document.body.style.backgroundImage = `url('${fullUrl}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.backgroundPosition = 'center';
      setBgSuccess('Fon rasm yuklandi va o\'rnatildi!');
      setBgFile(null);
    } catch (err) { setBgError(err.message || 'Xatolik.'); }
    finally { setBgLoading(false); }
  }

  // Fonni olib tashlash
  async function handleRemoveBg() {
    setBgLoading(true); setBgError(''); setBgSuccess('');
    try {
      await settingsApi.setBackground('');
      setCurrentBg('');
      document.body.style.backgroundImage = '';
      setBgSuccess('Fon rasm olib tashlandi.');
    } catch (err) { setBgError(err.message || 'Xatolik.'); }
    finally { setBgLoading(false); }
  }

  const filterOptions = [
    { value: '', label: 'Barchasi' },
    { value: 'kutilmoqda', label: 'Kutilmoqda' },
    { value: 'korib_chiqildi', label: "Ko'rib chiqildi" },
    { value: 'bajarildi', label: 'Bajarildi' },
  ];

  return (
    <div className="page-container">
      <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 24 }}>🛠 Admin Panel</h1>

      {/* Tab tugmalari */}
      <div className="filter-tabs" style={{ marginBottom: 28 }}>
        {[
          { key: 'suggestions', label: '💬 Takliflar' },
          { key: 'upload', label: '📁 Kontent yuklash' },
          { key: 'youtube', label: '▶ YouTube' },
          { key: 'background', label: '🖼 Fon rasm' },
        ].map((t) => (
          <button key={t.key} className={`filter-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ===== TAKLIFLAR ===== */}
      {tab === 'suggestions' && (
        <>
          <div className="filter-tabs" style={{ marginBottom: 20 }}>
            {filterOptions.map((f) => (
              <button key={f.value} className={`filter-tab ${statusFilter === f.value ? 'active' : ''}`} onClick={() => setStatusFilter(f.value)}>
                {f.label}
              </button>
            ))}
          </div>
          {sugLoading && <p className="page-loading">Yuklanmoqda...</p>}
          {sugError && <div className="auth-error">{sugError}</div>}
          {!sugLoading && suggestions.length === 0 && <p className="empty-msg">Takliflar topilmadi.</p>}
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
                  </div>
                  <p className="suggestion-msg">{s.message}</p>
                  {s.admin_reply && !isEditing && (
                    <div className="admin-reply-box">
                      <span className="admin-reply-label">Sizning javobingiz:</span>
                      <p>{s.admin_reply}</p>
                    </div>
                  )}
                  {isEditing ? (
                    <div className="admin-edit-form">
                      {editError && <div className="auth-error" style={{ marginBottom: 10 }}>{editError}</div>}
                      <div className="form-group">
                        <label>Holat</label>
                        <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} disabled={editLoading}>
                          <option value="kutilmoqda">Kutilmoqda</option>
                          <option value="korib_chiqildi">Ko'rib chiqildi</option>
                          <option value="bajarildi">Bajarildi</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Javob</label>
                        <textarea value={editReply} onChange={(e) => setEditReply(e.target.value)} rows={3} disabled={editLoading} />
                      </div>
                      <div className="profile-edit-actions">
                        <button className="btn-primary" onClick={() => handleEditSave(s.id)} disabled={editLoading}>
                          {editLoading ? 'Saqlanmoqda...' : 'Saqlash'}
                        </button>
                        <button className="btn-secondary" onClick={closeEdit} disabled={editLoading}>Bekor</button>
                      </div>
                    </div>
                  ) : (
                    <button className="btn-secondary" style={{ marginTop: 10, alignSelf: 'flex-start' }} onClick={() => openEdit(s)}>
                      Javob / Holat
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ===== KONTENT YUKLASH ===== */}
      {tab === 'upload' && (
        <div className="upload-box">
          <h3>Yangi kontent yuklash</h3>
          {uploadError && <div className="auth-error">{uploadError}</div>}
          {uploadSuccess && <div className="success-banner">{uploadSuccess}</div>}
          <form onSubmit={handleUpload} className="upload-form">
            <div className="form-group">
              <label>Kontent turi</label>
              <select value={uploadForm.type} onChange={(e) => setUploadForm((p) => ({ ...p, type: e.target.value }))} disabled={uploading}>
                <option value="book">📚 Kitob</option>
                <option value="video">🎬 Video</option>
                <option value="audio">🎧 Audio</option>
              </select>
            </div>
            <div className="form-group">
              <label>Sarlavha</label>
              <input placeholder="Kontent sarlavhasi" value={uploadForm.title}
                onChange={(e) => { setUploadForm((p) => ({ ...p, title: e.target.value })); setUploadError(''); setUploadSuccess(''); }}
                disabled={uploading} />
            </div>
            <div className="form-group">
              <label>Tavsif (ixtiyoriy)</label>
              <textarea placeholder="Qisqacha tavsif..." value={uploadForm.description}
                onChange={(e) => setUploadForm((p) => ({ ...p, description: e.target.value }))} rows={2} disabled={uploading} />
            </div>
            <div className="form-group">
              <label>Fayl</label>
              <input type="file" onChange={(e) => setUploadFile(e.target.files[0] || null)} disabled={uploading} />
            </div>
            <button type="submit" className="btn-primary" disabled={uploading}>
              {uploading ? 'Yuklanmoqda...' : 'Yuklash'}
            </button>
          </form>
        </div>
      )}

      {/* ===== YOUTUBE ===== */}
      {tab === 'youtube' && (
        <div className="upload-box">
          <h3>YouTube kontent qo'shish</h3>
          {ytError && <div className="auth-error">{ytError}</div>}
          {ytSuccess && <div className="success-banner">{ytSuccess}</div>}
          <form onSubmit={handleAddYoutube} className="upload-form">
            <div className="form-group">
              <label>Kontent turi</label>
              <select value={ytForm.type} onChange={(e) => setYtForm((p) => ({ ...p, type: e.target.value }))} disabled={ytLoading}>
                <option value="video">🎬 Video</option>
                <option value="audio">🎧 Audio</option>
              </select>
            </div>
            <div className="form-group">
              <label>Sarlavha</label>
              <input placeholder="Kontent sarlavhasi" value={ytForm.title}
                onChange={(e) => { setYtForm((p) => ({ ...p, title: e.target.value })); setYtError(''); setYtSuccess(''); }}
                disabled={ytLoading} />
            </div>
            <div className="form-group">
              <label>Tavsif (ixtiyoriy)</label>
              <textarea placeholder="Qisqacha tavsif..." value={ytForm.description}
                onChange={(e) => setYtForm((p) => ({ ...p, description: e.target.value }))} rows={2} disabled={ytLoading} />
            </div>
            <div className="form-group">
              <label>YouTube link</label>
              <input placeholder="https://www.youtube.com/watch?v=..." value={ytForm.youtube_url}
                onChange={(e) => { setYtForm((p) => ({ ...p, youtube_url: e.target.value })); setYtError(''); setYtSuccess(''); }}
                disabled={ytLoading} />
            </div>
            <button type="submit" className="btn-primary" disabled={ytLoading}>
              {ytLoading ? 'Qo\'shilmoqda...' : '+ Kutubxonaga qo\'shish'}
            </button>
          </form>
        </div>
      )}

      {/* ===== FON RASM ===== */}
      {tab === 'background' && (
        <div className="upload-box">
          <h3>🖼 Sayt fon rasmini o'rnatish</h3>
          <p style={{ color: '#666', marginBottom: 20, fontSize: '0.9rem' }}>
            Fon rasm barcha sahifalarda orqa fonda ko'rinadi.
            {currentBg && <> Joriy fon: <code style={{ fontSize: '0.8rem' }}>{currentBg.slice(0, 60)}...</code></>}
          </p>

          {bgError && <div className="auth-error">{bgError}</div>}
          {bgSuccess && <div className="success-banner">{bgSuccess}</div>}

          {/* URL orqali */}
          <form onSubmit={handleBgUrl} className="upload-form" style={{ marginBottom: 24 }}>
            <div className="form-group">
              <label>🔗 URL orqali (internet havolasi)</label>
              <input placeholder="https://example.com/background.jpg" value={bgUrl}
                onChange={(e) => { setBgUrl(e.target.value); setBgError(''); setBgSuccess(''); }}
                disabled={bgLoading} />
            </div>
            <button type="submit" className="btn-primary" disabled={bgLoading || !bgUrl.trim()}>
              {bgLoading ? 'O\'rnatilmoqda...' : 'URL orqali o\'rnatish'}
            </button>
          </form>

          <hr style={{ margin: '20px 0', borderColor: '#eee' }} />

          {/* Fayl yuklash orqali */}
          <form onSubmit={handleBgUpload} className="upload-form" style={{ marginBottom: 24 }}>
            <div className="form-group">
              <label>📁 Fayl yuklash orqali</label>
              <input type="file" accept="image/*" onChange={(e) => setBgFile(e.target.files[0] || null)} disabled={bgLoading} />
            </div>
            <button type="submit" className="btn-primary" disabled={bgLoading || !bgFile}>
              {bgLoading ? 'Yuklanmoqda...' : 'Fayl yuklash va o\'rnatish'}
            </button>
          </form>

          {currentBg && (
            <>
              <hr style={{ margin: '20px 0', borderColor: '#eee' }} />
              <button className="btn-danger" onClick={handleRemoveBg} disabled={bgLoading}>
                🗑 Fon rasmni olib tashlash
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
