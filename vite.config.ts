import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This ensures process.env.API_KEY works in the browser for the GenAI SDK
    'process.env': process.env
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});