import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ExamApp from './ExamApp';
import '../styles/global.css';

// HashRouter, not BrowserRouter: this entry point is served as a plain
// static file at /exam.html, so deep links must not require a server
// rewrite rule that the live app's host does not have.
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false, retry: 1 } },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <ExamApp />
      </HashRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
