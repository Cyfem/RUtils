import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['babel-plugin-react-compiler'],
          ['@babel/plugin-transform-class-static-block'],
          ['@babel/plugin-proposal-decorators', { version: '2023-11' }],
          ['@babel/plugin-proposal-class-properties', { loose: true }],
        ],
      },
    }),
  ],
  esbuild: {
    target: 'es2022',
  },
  root: __dirname,
  resolve: {
    alias: {
      rxtutils: path.resolve(__dirname, '../packages/index.ts'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
