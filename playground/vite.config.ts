import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: __dirname, // Set root to playground directory
  resolve: {
    alias: {
      // Alias the library name to source code for instant HMR
      'rxtutils': path.resolve(__dirname, '../packages/index.ts'),
    },
  },
  server: {
    port: 5173,
    open: true
  }
});
