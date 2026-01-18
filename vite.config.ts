import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // FIX: The reference to Node.js types was causing an error, and `process.cwd()`
  // is not available without it. Replacing `process.cwd()` with `''` works because
  // `loadEnv` resolves an empty string for the directory to the current working directory.
  const env = loadEnv(mode, '', '');
  return {
    plugins: [react()],
    // Use a relative base path. This is a robust way to ensure all assets
    // are loaded correctly, regardless of the repository name or domain.
    base: './',
    build: {
      target: 'esnext'
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});
