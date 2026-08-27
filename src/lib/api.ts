import axios from 'axios';
import { CapacitorHttp, Capacitor } from '@capacitor/core';

/**
 * Where the API is, and why this is not one string any more.
 *
 * Until 2026-08-27 it was the absolute `https://selmapp.com/api/v1`, which
 * meant the web app made a cross-origin request on every call no matter
 * which host it was served from. On that day `app.selmapp.ca` was pointed at
 * the same DigitalOcean app, whose routing rules already send `/` to the web
 * bundle and `/api` to the API and match all domains. So on the web the API
 * is now simply **relative**: whichever host serves the page serves the API,
 * same-origin, no CORS, and no host baked into the bundle to go stale.
 *
 * Native is the one case that has no host of its own — a Capacitor WebView
 * loads from the app package — so it keeps an absolute one, and that is now
 * `app.selmapp.ca` rather than `selmapp.com`. This was the cheapest day it
 * will ever be to change: there are no installs yet, so no shipped binary is
 * pointing at the old host. Every day after this one it gets more expensive.
 *
 * `import.meta.env.DEV` keeps `vite dev` working: there is no dev proxy in
 * `vite.config.ts`, so a relative path on :5173 would hit nothing.
 */
export const API_HOST = 'https://app.selmapp.ca';

export const API_BASE =
  Capacitor.isNativePlatform() || import.meta.env.DEV
    ? `${API_HOST}/api/v1`
    : '/api/v1';

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

// Account deletion — required by App Store Guideline 5.1.1(v).
// Calls the backend's DELETE /users/account?confirm_deletion=true which
// soft-deletes the account (anonymises email/username, preserves audit
// hash, frees the email for reuse). Caller must clear localStorage and
// route the user out afterwards.
export async function deleteAccount(): Promise<{ success: boolean; message: string }> {
  const token = tokenStore.get();
  const url = `${API_BASE}/users/account?confirm_deletion=true`;
  let data: any;
  let ok: boolean;
  if (Capacitor.isNativePlatform()) {
    const res = await CapacitorHttp.request({
      url,
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      responseType: 'json',
    });
    data = res.data;
    ok = res.status >= 200 && res.status < 300;
  } else {
    const r = await fetch(url, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    data = await r.json().catch(() => ({}));
    ok = r.ok;
  }
  if (!ok) {
    const detail = data?.detail || (typeof data === 'string' ? data : JSON.stringify(data));
    throw new Error(detail || 'Account deletion failed');
  }
  return { success: true, message: data?.message || 'Account deleted.' };
}

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
  // Request a password-reset email. Backend always returns 200 with a generic
  // success message (anti-enumeration), so we don't read the email back; the
  // UI just tells the user to check their inbox if an account exists.
  async forgotPassword(email: string) {
    const r = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data?.detail || 'Could not send reset email');
    return data;
  },
  // Submit a new password using the token from the reset-email link.
  async resetPassword(token: string, newPassword: string) {
    const r = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password: newPassword }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data?.detail || 'Could not reset password');
    return data;
  },
  // Sign in with Apple — sends the identity token from the native Apple flow
  // to the backend, which verifies it against Apple's public keys (JWKS) and
  // either creates or logs in the user. Endpoint: /auth/oauth/apple/native.
  // Backend expects only { identity_token, full_name?, email? }; the extra
  // fields the plugin returns (authorization_code, user, given_name,
  // family_name) are collapsed into full_name here.
  async appleLogin(payload: {
    identity_token: string;
    authorization_code?: string;
    user?: string;
    email?: string;
    given_name?: string;
    family_name?: string;
  }) {
    const full_name = [payload.given_name, payload.family_name]
      .filter(Boolean)
      .join(' ')
      .trim() || undefined;
    const body = {
      identity_token: payload.identity_token,
      full_name,
      email: payload.email,
    };
    // Inside Capacitor use the native HTTP plugin — WKWebView's fetch has
    // been flaky on iOS 26 simulators for large JSON bodies (Apple identity
    // tokens are ~1.5 KB JWTs), throwing "Load failed" TypeError before the
    // request even reaches the network. CapacitorHttp routes the call
    // through native NSURLSession which bypasses WebKit's fetch entirely.
    let data: any;
    let ok: boolean;
    if (Capacitor.isNativePlatform()) {
      const res = await CapacitorHttp.request({
        url: `${API_BASE}/auth/oauth/apple/native`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: body,
        responseType: 'json',
      });
      data = res.data;
      ok = res.status >= 200 && res.status < 300;
      if (!ok && typeof data === 'string') {
        try { data = JSON.parse(data); } catch { /* keep string */ }
      }
    } else {
      const r = await fetch(`${API_BASE}/auth/oauth/apple/native`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      data = await r.json().catch(() => ({}));
      ok = r.ok;
    }
    if (!ok) {
      const detail = data?.detail || (typeof data === 'string' ? data : JSON.stringify(data));
      throw new Error(detail || 'Apple sign-in failed');
    }
    const token = data.access_token || data.token;
    if (token) tokenStore.set(token);
    // The backend returns the JWT; user info is fetched separately via /auth/me.
    let user = data.user || null;
    if (token && !user) {
      try {
        if (Capacitor.isNativePlatform()) {
          const meRes = await CapacitorHttp.request({
            url: `${API_BASE}/auth/me`,
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'json',
          });
          if (meRes.status >= 200 && meRes.status < 300) user = meRes.data;
        } else {
          const me = await fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (me.ok) user = await me.json();
        }
      } catch { /* silent — caller falls back */ }
    }
    return { token, user };
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
