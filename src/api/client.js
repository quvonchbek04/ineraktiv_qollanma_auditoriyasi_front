// api/client.js — Backend bilan bog'lanish uchun markaziy funksiya

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token');
}

async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Server xatosi yuz berdi.');
  }
  return data;
}

// ===== AUTH — faqat ism bilan kirish =====
export const authApi = {
  enter: (full_name) =>
    apiRequest('/auth/enter', { method: 'POST', body: JSON.stringify({ full_name }) })
};

// ===== USERS =====
export const usersApi = {
  getMe: () => apiRequest('/users/me'),
  updateMe: (data) => apiRequest('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
  getUser: (id) => apiRequest(`/users/${id}`)
};

// ===== CONTENT =====
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

// ===== SUGGESTIONS =====
export const suggestionsApi = {
  create: (message) => apiRequest('/suggestions', { method: 'POST', body: JSON.stringify({ message }) }),
  getMine: () => apiRequest('/suggestions/mine'),
  getAll: (status) => apiRequest(`/suggestions/all${status ? `?status=${status}` : ''}`),
  update: (id, data) => apiRequest(`/suggestions/${id}`, { method: 'PUT', body: JSON.stringify(data) })
};

// ===== AI KITOB O'QUVCHI =====
export const aiApi = {
  ask: (contentId, question, history = []) =>
    apiRequest('/ai/ask', { method: 'POST', body: JSON.stringify({ contentId, question, history }) })
};

// ===== SETTINGS (fon rasm) =====
export const settingsApi = {
  getBackground: () => apiRequest('/settings/background'),
  setBackground: (url) =>
    apiRequest('/settings/background', { method: 'POST', body: JSON.stringify({ url }) }),
  uploadBackground: (formData) =>
    apiRequest('/settings/background-upload', { method: 'POST', body: formData })
};

// ===== DIARY (kundalik) =====
export const diaryApi = {
  getAll: () => apiRequest('/diary'),
  create: (title, body) => apiRequest('/diary', { method: 'POST', body: JSON.stringify({ title, body }) }),
  update: (id, data) => apiRequest(`/diary/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => apiRequest(`/diary/${id}`, { method: 'DELETE' })
};

export { API_URL, getToken };
