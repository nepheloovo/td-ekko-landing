import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Relative base: the same build must work at '/' (dev/preview) and at
  // '/<repo>/' (GitHub Pages project sites). Absolute /assets/... paths would
  // 404 under a sub-path, so all asset URLs go through src/lib/asset.ts.
  base: './',
  plugins: [react()],
  server: { host: '127.0.0.1', port: 5180 },
  build: { target: 'es2020', assetsInlineLimit: 0 },
});
