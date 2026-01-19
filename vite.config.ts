
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use a relative base path. This is a robust way to ensure all assets
  // are loaded correctly, regardless of the repository name or domain.
  base: './',
  build: {
    target: 'esnext'
  }
});
