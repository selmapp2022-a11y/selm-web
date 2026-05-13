import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './styles/global.css';

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
