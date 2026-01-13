import dts from 'rollup-plugin-dts';
import typescript from '@rollup/plugin-typescript';
import fg from 'fast-glob';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

// 自动扫描入口文件
// 规则：包含 packages/index.ts 和 packages 下所有子目录的 index.ts
const files = fg.sync([
  'packages/index.ts',
  'packages/*/index.ts'
]);

// 转换为 input object 形式: { 'index': 'packages/index.ts', 'store/index': 'packages/store/index.ts' }
const entries = files.reduce((acc, file) => {
  const name = file.replace(/^packages\//, '').replace(/\.ts$/, '');
  acc[name] = file;
  return acc;
}, {});

// 自动生成 external 列表
// 包含 dependencies, peerDependencies (转为正则匹配子路径) 和 node_modules
const externals = [
  ...Object.keys(pkg.dependencies || {}).map(key => new RegExp(`^${key}`)),
  ...Object.keys(pkg.peerDependencies || {}).map(key => new RegExp(`^${key}`)),
  /node_modules/
];

export default [
  // JS 构建 (ESM & CJS)
  {
    input: entries,
    output: [
      {
        dir: 'es',
        format: 'es',
        preserveModules: true,
        preserveModulesRoot: 'packages',
        entryFileNames: '[name].mjs',
        exports: 'named',
      },
      {
        dir: 'cjs',
        format: 'cjs',
        preserveModules: true,
        preserveModulesRoot: 'packages',
        entryFileNames: '[name].cjs',
        exports: 'named',
      },
    ],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false, // 类型声明由 dts 插件单独处理
      }),
    ],
    external: externals,
  },
  // 类型定义构建 (DTS)
  {
    input: entries,
    output: [
      {
        dir: 'es',
        format: 'es',
        preserveModules: true,
        preserveModulesRoot: 'packages',
        entryFileNames: '[name].d.ts',
      },
      {
        dir: 'cjs',
        format: 'cjs',
        preserveModules: true,
        preserveModulesRoot: 'packages',
        entryFileNames: '[name].d.ts',
      }
    ],
    plugins: [
      dts()
    ],
    external: externals,
  },
];
