// pages/Library.jsx — Kutubxona sahifasi
// Foydalanuvchilar: faqat ko'rish va yuklab olish
// Admin: kontent yuklash AdminPanel orqali amalga oshiriladi

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contentApi, API_URL } from '../api/client';

function getYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function Library() {
  const navigate = useNavigate();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [activeEmbed, setActiveEmbed] = useState(null);

  useEffect(() => { loadContent(); }, [filter]);

  async function loadContent() {
    setLoading(true); setError('');
    try {
      const data = await contentApi.getAll(filter);
      setContent(data.content || []);
    } catch { setError('Kontentlarni yuklashda xatolik yuz berdi.'); }
    finally { setLoading(false); }
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
      </div>

      {/* Filter tugmalari */}
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
              {item.description && <p className="content-card-desc">{item.description}</p>}
              <p className="content-card-author">
                Muallif: <strong>{item.author_name}</strong>
              </p>

              {/* YouTube embed */}
              {item.content_source === 'youtube' && ytId && (
                <div className="content-card-actions">
                  <button className="btn-secondary" onClick={() => setActiveEmbed(isEmbedOpen ? null : item.id)}>
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

              {/* Yuklangan fayl — yuklab olish */}
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
                  {item.type === 'book' && (
                    <button
                      className="btn-primary"
                      style={{ marginLeft: '0.5rem' }}
                      onClick={() => navigate(`/book-reader/${item.id}`)}
                    >
                      🤖 AI bilan o'qi
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
