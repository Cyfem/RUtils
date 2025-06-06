import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'packages/index.ts'),
      name: 'rxtutils',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: [] // 可以配置外部依赖
    }
  }
});
