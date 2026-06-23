// api/client.js — Backend bilan bog'lanish uchun markaziy funksiya
// Barcha so'rovlar shu fayl orqali yuboriladi (token avtomatik qo'shiladi)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Token'ni localStorage'dan olish (login qilingandan keyin saqlanadi)
function getToken() {
  return localStorage.getItem('token');
}

// Asosiy so'rov funksiyasi
async function apiRequest(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    ...(options.headers || {})
  };

  // FormData (fayl yuklash) bo'lmasa, JSON sifatida yuboramiz
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Server xatosi yuz berdi.');
  }

  return data;
}

// ===== AUTH =====
export const authApi = {
  register: (full_name, email, password) =>
    apiRequest('/auth/register', { method: 'POST', body: JSON.stringify({ full_name, email, password }) }),
  login: (email, password) =>
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
};

// ===== USERS =====
export const usersApi = {
  getMe: () => apiRequest('/users/me'),
  updateMe: (data) => apiRequest('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
  getUser: (id) => apiRequest(`/users/${id}`)
};

// ===== CONTENT (kitob/video/audio + YouTube) =====
export const contentApi = {
  getAll: (type) => apiRequest(`/content${type ? `?type=${type}` : ''}`),
  getMine: () => apiRequest('/content/mine'),
  upload: (formData) => apiRequest('/content/upload', { method: 'POST', body: formData }),
  remove: (id) => apiRequest(`/content/${id}`, { method: 'DELETE' }),
  addYoutube: (data) => apiRequest('/content/youtube', { method: 'POST', body: JSON.stringify(data) }),
  removeYoutube: (id) => apiRequest(`/content/youtube/${id}`, { method: 'DELETE' })
};

// ===== BLOG =====
export const blogApi = {
  getAll: (userId) => apiRequest(`/blog${userId ? `?user_id=${userId}` : ''}`),
  getOne: (id) => apiRequest(`/blog/${id}`),
  getMine: () => apiRequest('/blog/mine/all'),
  create: (title, body) => apiRequest('/blog', { method: 'POST', body: JSON.stringify({ title, body }) }),
  update: (id, data) => apiRequest(`/blog/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => apiRequest(`/blog/${id}`, { method: 'DELETE' })
};

// ===== SUGGESTIONS (taklif/chat) =====
export const suggestionsApi = {
  create: (message) => apiRequest('/suggestions', { method: 'POST', body: JSON.stringify({ message }) }),
  getMine: () => apiRequest('/suggestions/mine'),
  getAll: (status) => apiRequest(`/suggestions/all${status ? `?status=${status}` : ''}`),
  update: (id, data) => apiRequest(`/suggestions/${id}`, { method: 'PUT', body: JSON.stringify(data) })
};

// ===== AI KITOB O'QUVCHI =====
export const aiApi = {
  ask: (contentId, question, history = []) =>
    apiRequest('/ai/ask', {
      method: 'POST',
      body: JSON.stringify({ contentId, question, history })
    })
};

export { API_URL, getToken };
