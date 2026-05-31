// services/api.js
// Centralized API client with JWT token injection

const BASE_URL = import.meta.env.VITE_API_URL || '';

// ── Token management ─────────────────────────────────────────
export const getToken  = () => localStorage.getItem('pp_token');
export const setToken  = (t) => localStorage.setItem('pp_token', t);
export const clearAuth = () => {
  localStorage.removeItem('pp_token');
  localStorage.removeItem('pp_user');
};

// ── Core fetch wrapper ───────────────────────────────────────
async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      data?.errors?.[0]?.msg || data?.message || `HTTP ${res.status}`;
    throw new Error(message);
  }

  return data;
}

// ── Auth ─────────────────────────────────────────────────────
export const authAPI = {
  register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login:    (body) => request('/api/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
};

// ── Dashboard ────────────────────────────────────────────────
export const dashboardAPI = {
  get: () => request('/api/dashboard'),
};

// ── Tasks ────────────────────────────────────────────────────
export const tasksAPI = {
  list:   ()         => request('/api/tasks'),
  create: (body)     => request('/api/tasks', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id)       => request(`/api/tasks/${id}`, { method: 'DELETE' }),
};

// ── Study Sessions ───────────────────────────────────────────
export const sessionsAPI = {
  list:   ()     => request('/api/sessions'),
  create: (body) => request('/api/sessions', { method: 'POST', body: JSON.stringify(body) }),
  remove: (id)   => request(`/api/sessions/${id}`, { method: 'DELETE' }),
};

// ── Analytics ────────────────────────────────────────────────
export const analyticsAPI = {
  get: () => request('/api/analytics'),
};

// ── Profile ──────────────────────────────────────────────────
export const profileAPI = {
  get:    ()     => request('/api/profile'),
  update: (body) => request('/api/profile', { method: 'PUT', body: JSON.stringify(body) }),
};
