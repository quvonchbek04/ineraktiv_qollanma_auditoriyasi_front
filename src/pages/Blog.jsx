// pages/Blog.jsx — Blog sahifasi
// - Barcha postlarni ko'rish (hammaga ochiq)
// - Login qilgan foydalanuvchi yangi post yoza oladi
// - Post egasi o'z postini tahrirlash va o'chirish mumkin
// - Bitta postni to'liq ochib ko'rish (modal ko'rinishida)

import { useState, useEffect } from 'react';
import { blogApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Blog() {
  const { user, isAuthenticated } = useAuth();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Post yaratish / tahrirlash formasi
  const [showForm, setShowForm] = useState(false);
  const [editPost, setEditPost] = useState(null); // null = yangi post, object = tahrirlash
  const [form, setForm] = useState({ title: '', body: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // To'liq postni ko'rish (modal)
  const [openPost, setOpenPost] = useState(null);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    setError('');
    try {
      const data = await blogApi.getAll();
      setPosts(data.posts || []);
    } catch {
      setError('Postlarni yuklashda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  }

  function openCreateForm() {
    setEditPost(null);
    setForm({ title: '', body: '' });
    setFormError('');
    setShowForm(true);
  }

  function openEditForm(post) {
    setEditPost(post);
    setForm({ title: post.title, body: post.body });
    setFormError('');
    setShowForm(true);
    setOpenPost(null);
  }

  function closeForm() {
    setShowForm(false);
    setEditPost(null);
    setFormError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      setFormError('Sarlavha va matn kiritilishi shart.');
      return;
    }
    setFormLoading(true);
    setFormError('');
    try {
      if (editPost) {
        await blogApi.update(editPost.id, { title: form.title.trim(), body: form.body.trim() });
      } else {
        await blogApi.create(form.title.trim(), form.body.trim());
      }
      closeForm();
      loadPosts();
    } catch (err) {
      setFormError(err.message || 'Xatolik yuz berdi.');
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Bu postni o\'chirishni tasdiqlaysizmi?')) return;
    try {
      await blogApi.remove(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      if (openPost?.id === id) setOpenPost(null);
    } catch (err) {
      alert(err.message || 'O\'chirishda xatolik.');
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('uz-UZ', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  function truncate(text, len = 180) {
    if (!text) return '';
    return text.length > len ? text.slice(0, len) + '...' : text;
  }

  return (
    <div className="page-container">

      {/* ===== SARLAVHA ===== */}
      <div className="library-header">
        <h1>Blog</h1>
        {isAuthenticated && (
          <button className="btn-primary" onClick={openCreateForm}>
            + Yangi post
          </button>
        )}
      </div>

      {/* ===== POST YARATISH / TAHRIRLASH FORMASI ===== */}
      {showForm && (
        <div className="blog-form-box">
          <h3>{editPost ? 'Postni tahrirlash' : 'Yangi post yozish'}</h3>
          {formError && <div className="auth-error">{formError}</div>}
          <form onSubmit={handleSubmit} className="upload-form">
            <div className="form-group">
              <label>Sarlavha</label>
              <input
                placeholder="Post sarlavhasi"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                disabled={formLoading}
              />
            </div>
            <div className="form-group">
              <label>Matn</label>
              <textarea
                placeholder="Post matnini yozing..."
                value={form.body}
                onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
                rows={7}
                disabled={formLoading}
              />
            </div>
            <div className="profile-edit-actions">
              <button type="submit" className="btn-primary" disabled={formLoading}>
                {formLoading ? 'Saqlanmoqda...' : editPost ? 'Yangilash' : 'Nashr qilish'}
              </button>
              <button type="button" className="btn-secondary" onClick={closeForm} disabled={formLoading}>
                Bekor qilish
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===== POSTLAR RO'YXATI ===== */}
      {loading && <p className="page-loading">Yuklanmoqda...</p>}
      {error && <div className="auth-error">{error}</div>}

      {!loading && posts.length === 0 && (
        <p className="empty-msg">Hozircha blog postlari mavjud emas. Birinchi bo'ling!</p>
      )}

      <div className="blog-grid">
        {posts.map((post) => {
          const isOwner = user && user.id === post.user_id;
          return (
            <div key={post.id} className="blog-card">
              <div className="blog-card-meta">
                <div className="blog-author-avatar">
                  {post.author_avatar ? (
                    <img src={post.author_avatar} alt={post.author_name} />
                  ) : (
                    <div className="blog-author-placeholder">
                      {post.author_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div>
                  <span className="blog-author-name">{post.author_name}</span>
                  <span className="blog-date">{formatDate(post.created_at)}</span>
                </div>
              </div>

              <h3 className="blog-card-title">{post.title}</h3>
              <p className="blog-card-body">{truncate(post.body)}</p>

              <div className="blog-card-footer">
                <button
                  className="btn-secondary blog-read-btn"
                  onClick={() => setOpenPost(post)}
                >
                  To'liq o'qish →
                </button>
                {isOwner && (
                  <div className="blog-owner-actions">
                    <button className="btn-secondary" onClick={() => openEditForm(post)}>
                      Tahrirlash
                    </button>
                    <button className="btn-danger" onClick={() => handleDelete(post.id)}>
                      O'chirish
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== TO'LIQ POST MODAL ===== */}
      {openPost && (
        <div className="modal-overlay" onClick={() => setOpenPost(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setOpenPost(null)}>✕</button>

            <div className="blog-card-meta" style={{ marginBottom: 16 }}>
              <div className="blog-author-avatar">
                {openPost.author_avatar ? (
                  <img src={openPost.author_avatar} alt={openPost.author_name} />
                ) : (
                  <div className="blog-author-placeholder">
                    {openPost.author_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div>
                <span className="blog-author-name">{openPost.author_name}</span>
                <span className="blog-date">{formatDate(openPost.created_at)}</span>
                {openPost.updated_at && openPost.updated_at !== openPost.created_at && (
                  <span className="blog-date"> (tahrirlangan: {formatDate(openPost.updated_at)})</span>
                )}
              </div>
            </div>

            <h2 className="modal-title">{openPost.title}</h2>
            <div className="modal-body">{openPost.body}</div>

            {user && user.id === openPost.user_id && (
              <div className="profile-edit-actions" style={{ marginTop: 24 }}>
                <button className="btn-secondary" onClick={() => openEditForm(openPost)}>
                  Tahrirlash
                </button>
                <button className="btn-danger" onClick={() => handleDelete(openPost.id)}>
                  O'chirish
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
