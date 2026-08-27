/* A note about asset URLs and the CDN in front of this app, written after
   breaking it twice in one day.

   The static-site component serves `catchall_document: index.html`. A request
   for a file that is not deployed yet therefore returns index.html with HTTP
   200 — and Cloudflare caches a 200 for `s-maxage=86400`, a full day.

   So fetching a content-hashed bundle URL to check whether a deploy has
   landed POISONS that exact URL: when the deploy does land, index.html asks
   for the bundle and the CDN hands back HTML, and the app never boots.

   Check a deploy by loading `/`, which always exists, and reading which
   bundle it links. Never by fetching the bundle. */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './styles/global.css';

/* The safe way to check which build is live.

   Load the page and read `window.__SELM_BUILD__` — from the console, or from
   a script. Do NOT fetch a hashed bundle URL to find out, for the reason
   above: before the deploy lands that request returns index.html with a 200,
   and the CDN keeps it for a day, so the very act of checking breaks the
   thing being checked. */
(window as unknown as Record<string, string>).__SELM_BUILD__ = '2026-08-27-b';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, refetchOnWindowFocus: false, retry: 1 },
  },
});

// StrictMode double-renders components in development to surface side-effects
// — and on Android WebView in production builds we observed it producing a
// visibly duplicated dashboard (each card rendered twice). Drop StrictMode
// on the production bundle so the same code path that ships to the mobile
// apps doesn't pay that cost.
const tree = (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </QueryClientProvider>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  import.meta.env.DEV ? <React.StrictMode>{tree}</React.StrictMode> : tree
);

// Service-worker handling.
//
// On the web (selmapp.com) we register a small SW so the app works briefly
// offline. Inside Capacitor, however, the WebView already serves all assets
// from the bundle, and a leftover SW from a previous web visit will happily
// keep returning a stale snapshot of the React app — that's what made the
// Android build show duplicated dashboard cards. Inside Capacitor we
// proactively *unregister* any service worker and clear caches so the
// freshly-bundled UI is what actually renders.
const isCapacitor =
  typeof window !== 'undefined' &&
  (!!(window as any).Capacitor || /\bCapacitor\b/.test(navigator.userAgent || ''));

if (isCapacitor) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations()
      .then((regs) => Promise.all(regs.map((r) => r.unregister())))
      .catch(() => { /* ignore */ });
  }
  if ('caches' in window) {
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .catch(() => { /* ignore */ });
  }
} else if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* ignore */ });
  });
}
