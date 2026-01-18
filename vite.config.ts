
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: Replace <YOUR_REPO_NAME> with the name of your GitHub repository.
  // For example, if your repo URL is https://github.com/john-doe/polyglot-numbers,
  // the base should be '/polyglot-numbers/'.
  base: '/<YOUR_REPO_NAME>/',
});
