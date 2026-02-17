// Use relative path so Vite dev server proxy (vite.config.js) forwards requests to the backend.
const API_BASE = `${import.meta.env.VITE_API_URL}api`.replace(/([^:]\/)\/+/g, '$1');

async function parseErrorResponse(res) {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    const data = await res.json().catch(() => null);
    if (data && typeof data === 'object') {
      // common error shapes: { error: { message, code } } or { message }
      if (data.error && typeof data.error === 'object' && data.error.message) return data.error.message;
      if (data.error && typeof data.error === 'string') return data.error;
      if (data.message && typeof data.message === 'string') return data.message;
      return JSON.stringify(data);
    }
  }
  const text = await res.text().catch(() => null);
  return text || `Status ${res.status}`;
}

// Get auth token from localStorage
function getAuthToken() {
  return localStorage.getItem('token');
}

// Helper function for authenticated API calls
async function authFetch(url, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(url, {
    ...options,
    headers,
  });
  
  return res;
}

// Auth functions
export async function signup(name, email, password, confirmPassword) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, confirmPassword }),
  });
  
  const data = await res.json().catch(() => null);
  
  if (!res.ok) {
    const error = data?.error || data?.message || `Signup failed (${res.status})`;
    throw new Error(error);
  }
  
  // Store token and user info
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  
  return data;
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await res.json().catch(() => null);
  
  if (!res.ok) {
    const error = data?.error || data?.message || `Login failed (${res.status})`;
    throw new Error(error);
  }
  
  // Store token and user info
  if (data.token) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  
  return data;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

export function isAuthenticated() {
  return !!getAuthToken();
}

// API functions with authentication
export async function fetchPage(url) {
  const res = await authFetch(`${API_BASE}/fetch-page`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: url.trim() }),
  });
  
  if (!res.ok) {
    const err = await parseErrorResponse(res);
    throw new Error(err || `Request failed (${res.status})`);
  }
  return res.json().catch(() => {
    throw new Error('Invalid JSON response from fetch-page');
  });
}

export async function getReview(html, screenshotBase64, url) {
  const res = await authFetch(`${API_BASE}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ html, screenshotBase64, url }),
  });
  
  if (!res.ok) {
    const err = await parseErrorResponse(res);
    throw new Error(err || `Review failed (${res.status})`);
  }
  return res.json().catch(async () => {
    const text = await res.text().catch(() => null);
    throw new Error(text || 'Invalid JSON response from review');
  });
}

// Save review to backend API
export async function saveReviewToBackend(url, reviewJSON, screenshotBase64) {
  const res = await authFetch(`${API_BASE}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, reviewJSON, screenshotBase64 }),
  });
  
  if (!res.ok) {
    const err = await parseErrorResponse(res);
    throw new Error(err || `Save review failed (${res.status})`);
  }
  
  return res.json().catch(() => {
    throw new Error('Invalid JSON response from save review');
  });
}

// Get recent reviews from backend API
export async function getRecentReviews() {
  const res = await authFetch(`${API_BASE}/reviews/recent`, {
    method: 'GET',
  });
  
  if (!res.ok) {
    const err = await parseErrorResponse(res);
    throw new Error(err || `Get reviews failed (${res.status})`);
  }
  
  const data = await res.json().catch(() => {
    throw new Error('Invalid JSON response from get reviews');
  });
  
  return data.reviews || [];
}
