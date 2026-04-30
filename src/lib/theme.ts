// Dark mode: stores preference in localStorage and toggles `dark` class on <html>.

const KEY = 'selm_theme';
type Theme = 'light' | 'dark' | 'auto';

export function getStoredTheme(): Theme {
  return (localStorage.getItem(KEY) as Theme) || 'auto';
}

export function applyTheme(t: Theme) {
  localStorage.setItem(KEY, t);
  const isDark = t === 'dark' || (t === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', isDark);
  // Keep theme-color meta in sync for mobile UI
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', isDark ? '#0B1929' : '#183048');
}

export function initTheme() {
  applyTheme(getStoredTheme());
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', () => {
    if (getStoredTheme() === 'auto') applyTheme('auto');
  });
}

export type { Theme };
