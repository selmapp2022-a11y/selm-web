import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { host: '0.0.0.0', port: 5173, allowedHosts: true },
  preview: { host: '0.0.0.0', port: 4173, allowedHosts: true },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Two entry points in one repo: the live app at index.html and the exam
    // engine slice at exam.html. They share src/lib, src/store and the
    // stylesheet; their route trees and bundles are separate, so nothing in
    // the exam preview can reach the shipping app's routes.
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        exam: resolve(__dirname, 'exam.html'),
      },
    },
  },
});
