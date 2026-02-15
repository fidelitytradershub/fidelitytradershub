const API = process.env.NEXT_PUBLIC_API_URL;

// ─────────────────────────────────────────────
// Token Helpers
// ─────────────────────────────────────────────
export const saveToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('fth_token', token);
  }
};

export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('fth_token');
  }
  return null;
};

export const clearToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('fth_token');
    localStorage.removeItem('fth_admin');
  }
};

// ─────────────────────────────────────────────
// Base fetch wrapper
// Always sends:
//   1. credentials: 'include' → browser cookie (httpOnly jwt)
//   2. Authorization: Bearer  → token from localStorage (fallback)
// This ensures the backend protect middleware works in both
// cookie-based (same-origin) and cross-origin scenarios.
// ─────────────────────────────────────────────
const request = async (endpoint, options = {}) => {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    // Always send Authorization header as fallback for cross-origin requests
    // where cookies may not be forwarded despite credentials: 'include'
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // sends httpOnly cookie when same-origin / CORS allows
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

// ─────────────────────────────────────────────
// Auth Endpoints
// ─────────────────────────────────────────────

// POST /admin/login
export const login = async (email, password) => {
  const data = await request('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data.success && data.token) {
    saveToken(data.token);
  }
  return data;
};

// POST /admin/register
export const register = async (name, username, email, password) => {
  return await request('/admin/register', {
    method: 'POST',
    body: JSON.stringify({ name, username, email, password }),
  });
};

// POST /admin/logout
export const logout = async () => {
  clearToken();
  try {
    return await request('/admin/logout', { method: 'POST' });
  } catch {
    return { success: true };
  }
};

// GET /admin/me
export const getProfile = async () => {
  try {
    const token = getToken();
    if (!token) return { success: false };
    return await request('/admin/me', { method: 'GET' });
  } catch {
    clearToken();
    return { success: false };
  }
};

// POST /admin/reset-password-request
export const requestPasswordReset = async (email) => {
  return await request('/admin/reset-password-request', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
};

// POST /admin/reset-password/:token
export const resetPassword = async (token, newPassword) => {
  return await request(`/admin/reset-password/${token}`, {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
};

// PUT /admin/change-password (protected)
export const changePassword = async (currentPassword, newPassword) => {
  const data = await request('/admin/change-password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (data.success && data.token) {
    saveToken(data.token);
  }
  return data;
};

// GET /admin/verify/:token
export const verifyEmail = async (token) => {
  const res = await fetch(`${API}/admin/verify/${token}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Verification failed');
  return data;
};