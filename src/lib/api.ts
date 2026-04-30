import axios from 'axios';

export const API_BASE = 'https://selmapp.com/api/v1';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 60_000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('selm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('selm_token');
      if (!location.pathname.startsWith('/login') && !location.pathname.startsWith('/register')) {
        location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const tokenStore = {
  get: () => localStorage.getItem('selm_token'),
  set: (t: string) => localStorage.setItem('selm_token', t),
  clear: () => localStorage.removeItem('selm_token'),
};

export const auth = {
  async login(email: string, password: string) {
    const fd = new URLSearchParams();
    fd.set('username', email);
    fd.set('password', password);
    const r = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: fd.toString(),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data?.detail || 'Login failed');
    const token = data.access_token || data.token;
    if (token) tokenStore.set(token);
    return { token, user: data.user || null };
  },
  async register(payload: { email: string; password: string; full_name?: string; username?: string; native_language?: string }) {
    const r = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
        full_name: payload.full_name || payload.email.split('@')[0],
        username: payload.username || payload.email.split('@')[0] + Math.floor(Math.random() * 1000),
        native_language: payload.native_language || 'en',
      }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data?.detail || 'Registration failed');
    const token = data.access_token || data.token;
    if (token) tokenStore.set(token);
    return { token, user: data.user || null };
  },
  async me() {
    const { data } = await api.get('/auth/me');
    return data;
  },
};

// Many backend endpoints wrap their payload as { success: true, <key>: ..., metadata: ... }
// This helper unwraps it, returning the first non-success/metadata field if present.
export function unwrap<T = any>(raw: any, preferredKey?: string): T {
  if (!raw || typeof raw !== 'object') return raw;
  if (preferredKey && raw[preferredKey] !== undefined) return raw[preferredKey];
  if ('success' in raw) {
    const ignore = new Set(['success', 'metadata', 'error', 'message']);
    const k = Object.keys(raw).find((kk) => !ignore.has(kk));
    if (k) return raw[k];
  }
  return raw;
}

// Backend AI endpoints often return { content: "```json\n{...}\n```", success: true }.
// Strip the markdown fence and parse the JSON inside.
export function parseAIContent<T = any>(raw: any): T | null {
  let s: string | undefined;
  if (typeof raw === 'string') s = raw;
  else if (raw?.content) s = String(raw.content);
  else if (raw?.message) s = String(raw.message);
  if (!s) return null;
  // Strip ```json ... ``` fences
  s = s.trim();
  const fence = s.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?```\s*$/);
  if (fence) s = fence[1];
  try { return JSON.parse(s) as T; }
  catch {
    // Try to find a JSON object inside
    const m = s.match(/\{[\s\S]*\}/);
    if (m) { try { return JSON.parse(m[0]) as T; } catch { /* */ } }
    return null;
  }
}
