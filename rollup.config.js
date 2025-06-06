
// rollup.config.ts
import path from 'path';
import dts from 'rollup-plugin-dts';

const input = 'packages/index.ts';

export default [
  // JS 构建
  {
    input,
    plugins: [dts()],
    output: [
      {
        dir: 'dist/es',
        format: 'es',
        preserveModules: true,
        preserveModulesRoot: 'packages',
        entryFileNames: '[name].mjs',
      },
      {
        dir: 'dist/cjs',
        format: 'cjs',
        preserveModules: true,
        preserveModulesRoot: 'packages',
        entryFileNames: '[name].cjs',
      }
    ]
  },
  // 类型定义
  {
  input: 'packages/index.ts',
  output: {
    dir: 'dist/types', // 类型声明输出目录
    format: 'es',
    preserveModules: true, // 保留模块结构拆分
    preserveModulesRoot: 'packages',
    entryFileNames: '[name].d.ts', // 保持和源码文件名对应
  },
  plugins: [dts()],
  }
];
