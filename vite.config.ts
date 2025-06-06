import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  // build: {
  //   lib: {
  //     entry: path.resolve(__dirname, 'packages/index.ts'),
  //     name: 'rxtutils',
  //     formats: ['es', 'cjs'],
  //     // fileName: 不再用统一文件名，而由 preserveModules 控制
  //   },
  //   rollupOptions: {
  //     external: ['react'],
  //     output: {
  //       preserveModules: true,              // ✅ 放在 output 里
  //       preserveModulesRoot: 'packages',    // ✅ 指定保留根目录
  //       entryFileNames: '[name].js',
  //       dir: 'dist',                        // 输出目录
  //     },
  //   },
  //   outDir: 'dist', // 最终输出目录
  // },
});