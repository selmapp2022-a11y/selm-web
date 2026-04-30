import { api, API_BASE } from './api';

// Cache to avoid re-fetching the same TTS audio.
const cache = new Map<string, string>();

export async function aiTTS(text: string, opts?: { language?: string; slow?: boolean }): Promise<string | null> {
  const key = `${opts?.language || 'en'}:${opts?.slow ? 1 : 0}:${text}`;
  if (cache.has(key)) return cache.get(key)!;
  try {
    const token = localStorage.getItem('selm_token');
    const r = await fetch(`${API_BASE}/ai/text-to-speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ text, language: opts?.language || 'en', slow: !!opts?.slow }),
    });
    if (!r.ok) return null;
    const ct = r.headers.get('content-type') || '';
    if (ct.includes('json')) {
      // some deployments return a URL/JSON
      const data = await r.json();
      const url = data?.audio_url || data?.url || data?.file;
      if (url) { cache.set(key, url); return url; }
      return null;
    }
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    cache.set(key, url);
    return url;
  } catch {
    return null;
  }
}

// Browser TTS fallback (always works, lower quality)
export function browserTTS(text: string, rate = 1) {
  try {
    if (!('speechSynthesis' in window)) return false;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = rate;
    speechSynthesis.speak(u);
    return true;
  } catch { return false; }
}

export function stopBrowserTTS() {
  try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch { /* */ }
}

// Hint: keep `api` import used to ensure baseURL alignment
void api;
