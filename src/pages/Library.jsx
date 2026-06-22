// pages/Library.jsx — Kutubxona sahifasi
// - Barcha kontent (kitob/video/audio) ro'yxati
// - YouTube kontentlar iframe orqali embed ko'rsatiladi
// - Fayl ko'rinishida yuklangan kontentlar uchun yuklab olish havolasi
// - Tur bo'yicha filtrlash (barchasi / kitob / video / audio)

import { useState, useEffect } from 'react';
import { contentApi, API_URL } from '../api/client';
import { useAuth } from '../context/AuthContext';

// YouTube URL dan video ID ajratib olish
function getYoutubeId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export default function Library() {
  const { isAuthenticated } = useAuth();

  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState(''); // '' = barchasi, 'book', 'video', 'audio'
  const [activeEmbed, setActiveEmbed] = useState(null); // YouTube embed ochiq ID

  // ===== FAYL YUKLASH (login qilgan foydalanuvchi) =====
  const { isAuthenticated: loggedIn } = useAuth();
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ type: 'book', title: '', description: '' });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  useEffect(() => {
    loadContent();
  }, [filter]);

  async function loadContent() {
    setLoading(true);
    setError('');
    try {
      const data = await contentApi.getAll(filter);
      setContent(data.content || []);
    } catch {
      setError('Kontentlarni yuklashda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!uploadForm.title.trim()) {
      setUploadError('Sarlavha kiritilishi shart.');
      return;
    }
    if (!uploadFile) {
      setUploadError('Fayl tanlanishi shart.');
      return;
    }
    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

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
      setShowUpload(false);
      loadContent();
    } catch (err) {
      setUploadError(err.message || 'Yuklashda xatolik.');
    } finally {
      setUploading(false);
    }
  }

  const typeLabel = { book: '📚 Kitob', video: '🎬 Video', audio: '🎧 Audio' };
  const filters = [
    { value: '', label: 'Barchasi' },
    { value: 'book', label: '📚 Kitoblar' },
    { value: 'video', label: '🎬 Videolar' },
    { value: 'audio', label: '🎧 Audio' },
  ];

  return (
    <div className="page-container">
      <div className="library-header">
        <h1>Kutubxona</h1>
        {loggedIn && (
          <button className="btn-primary" onClick={() => setShowUpload(!showUpload)}>
            {showUpload ? 'Yopish' : '+ Fayl yuklash'}
          </button>
        )}
      </div>

      {/* ===== FAYL YUKLASH FORMASI ===== */}
      {showUpload && loggedIn && (
        <div className="upload-box">
          <h3>Yangi kontent yuklash</h3>
          {uploadError && <div className="auth-error">{uploadError}</div>}
          {uploadSuccess && <div className="success-banner">{uploadSuccess}</div>}

          <form onSubmit={handleUpload} className="upload-form">
            <div className="form-group">
              <label>Kontent turi</label>
              <select
                value={uploadForm.type}
                onChange={(e) => setUploadForm((p) => ({ ...p, type: e.target.value }))}
                disabled={uploading}
              >
                <option value="book">📚 Kitob</option>
                <option value="video">🎬 Video</option>
                <option value="audio">🎧 Audio</option>
              </select>
            </div>
            <div className="form-group">
              <label>Sarlavha</label>
              <input
                placeholder="Kontent sarlavhasi"
                value={uploadForm.title}
                onChange={(e) => setUploadForm((p) => ({ ...p, title: e.target.value }))}
                disabled={uploading}
              />
            </div>
            <div className="form-group">
              <label>Tavsif (ixtiyoriy)</label>
              <textarea
                placeholder="Qisqacha tavsif..."
                value={uploadForm.description}
                onChange={(e) => setUploadForm((p) => ({ ...p, description: e.target.value }))}
                rows={2}
                disabled={uploading}
              />
            </div>
            <div className="form-group">
              <label>Fayl</label>
              <input
                type="file"
                onChange={(e) => setUploadFile(e.target.files[0] || null)}
                disabled={uploading}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={uploading}>
              {uploading ? 'Yuklanmoqda...' : 'Yuklash'}
            </button>
          </form>
        </div>
      )}

      {/* ===== FILTER TUGMALARI ===== */}
      <div className="filter-tabs">
        {filters.map((f) => (
          <button
            key={f.value}
            className={`filter-tab ${filter === f.value ? 'active' : ''}`}
            onClick={() => { setFilter(f.value); setActiveEmbed(null); }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ===== KONTENT RO'YXATI ===== */}
      {loading && <p className="page-loading">Yuklanmoqda...</p>}
      {error && <div className="auth-error">{error}</div>}

      {!loading && content.length === 0 && (
        <p className="empty-msg">Hozircha bu bo'limda kontent mavjud emas.</p>
      )}

      <div className="content-grid">
        {content.map((item) => {
          const ytId = getYoutubeId(item.youtube_url);
          const isEmbedOpen = activeEmbed === item.id;

          return (
            <div key={item.id} className="content-card">
              <div className="content-card-header">
                <span className="content-type-badge">{typeLabel[item.type] || item.type}</span>
                {item.content_source === 'youtube' && (
                  <span className="content-yt-badge">YouTube</span>
                )}
              </div>

              <h3 className="content-card-title">{item.title}</h3>
              {item.description && (
                <p className="content-card-desc">{item.description}</p>
              )}
              <p className="content-card-author">
                Muallif: <strong>{item.author_name}</strong>
              </p>

              {/* YouTube embed */}
              {item.content_source === 'youtube' && ytId && (
                <div className="content-card-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => setActiveEmbed(isEmbedOpen ? null : item.id)}
                  >
                    {isEmbedOpen ? 'Yopish' : '▶ Ko\'rish'}
                  </button>
                  {isEmbedOpen && (
                    <div className="youtube-embed">
                      <iframe
                        src={`https://www.youtube.com/embed/${ytId}`}
                        title={item.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Fayl yuklangan kontent uchun yuklab olish */}
              {item.content_source === 'upload' && item.file_path && (
                <div className="content-card-actions">
                  <a
                    href={`${API_URL.replace('/api', '')}${item.file_path}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                    download
                  >
                    ⬇ Yuklab olish
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
