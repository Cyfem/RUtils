import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'path';

// 显式定义需要暴露的子模块入口
const subModules = ['cache', 'hooks', 'request', 'store', 'validator'];

const entries = {
  index: path.resolve(__dirname, 'packages/index.ts'),
  ...Object.fromEntries(
    subModules.map((m) => [m + '/index', path.resolve(__dirname, `packages/${m}/index.ts`)]),
  ),
};

// 显式定义外部依赖列表
const externals = ['axios', 'date-fns', 'lodash-es', 'react', 'tslib'];

export default defineConfig({
  plugins: [
    dts({
      outDir: 'es',
      include: ['packages/**/*.ts'],
      entryRoot: 'packages',
    }),
  ],
  build: {
    target: 'es2020',
    outDir: 'dist',
    lib: {
      entry: entries,
      name: 'RxtUtils',
    },
    rollupOptions: {
      external: (id) => {
        // 匹配精确包名或子路径（如 lodash-es/at）
        return externals.some((dep) => id === dep || id.startsWith(`${dep}/`));
      },
      output: [
        {
          format: 'es',
          dir: 'es',
          preserveModules: true,
          preserveModulesRoot: 'packages',
          entryFileNames: '[name].mjs',
          exports: 'named',
        },
        {
          format: 'cjs',
          dir: 'cjs',
          preserveModules: true,
          preserveModulesRoot: 'packages',
          entryFileNames: '[name].cjs',
          exports: 'named',
        },
      ],
    },
    minify: false,
  },
});
