
// rollup.config.ts
import dts from 'rollup-plugin-dts';
import typescript from '@rollup/plugin-typescript';
const input = 'packages/index.ts';

export default [
  // JS 构建
  {
    input,
    plugins: [
      typescript({})
    ],
    output: [
      {
        dir: 'dist/es',
        format: 'es',
        preserveModules: true,
        preserveModulesRoot: 'packages',
        entryFileNames: '[name].mjs'
      },
      {
        dir: 'dist/cjs',
        format: 'cjs',
        preserveModules: true,
        preserveModulesRoot: 'packages',
        entryFileNames: '[name].cjs'
      }
    ],
    external: [/node_modules/,"react"] // 避免将依赖打包进来
  },
  // 类型定义
  {
  input: input,
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
