
// rollup.config.ts
import dts from 'rollup-plugin-dts';
import typescript from '@rollup/plugin-typescript';

const externals = [
  'react',
  'axios',
  /^lodash-es(\/|$)/,
  'moment',
  'tslib',
  /^node:.*/
]

const input = [
  'packages/index.ts',
];

const packagesPaths = [
  'packages/validator/index.ts',
  'packages/store/index.ts',
  'packages/request/index.ts',
  'packages/cache/index.ts',
  'packages/hooks/index.ts',
]

export default [
  // JS 构建
  {
    input:[...input,...packagesPaths],
    plugins: [
      typescript({})
    ],
    output: [
      {
        dir: 'es',
        format: 'es',
        preserveModules: true,
        preserveModulesRoot: 'packages',
        entryFileNames: '[name].mjs'
      },
      {
        dir: 'cjs',
        format: 'cjs',
        preserveModules: true,
        preserveModulesRoot: 'packages',
        entryFileNames: '[name].cjs'
      }
    ],
    external: externals
  },
  // 类型定义
  {
  input,
  output: [
    {
      dir: 'es', // 类型声明输出目录
      format: 'es',
      preserveModules: true, // 保留模块结构拆分
      preserveModulesRoot: 'packages',
      entryFileNames: '[name].d.ts', // 保持和源码文件名对应
    },
    {
      dir: 'cjs', // 类型声明输出目录
      format: 'cjs',
      preserveModules: true, // 保留模块结构拆分
      preserveModulesRoot: 'packages',
      entryFileNames: '[name].d.ts', // 保持和源码文件名对应
    },
  ],
  plugins: [dts()],
  },

  ...packagesPaths.map(packagePath => ({
  input: packagePath,
  output: [
    {
      dir: 'es', // 类型声明输出目录
      format: 'es',
      preserveModules: true, // 保留模块结构拆分
      preserveModulesRoot: 'packages',
      entryFileNames: '[name].d.ts', // 保持和源码文件名对应
    },
    {
      dir: 'cjs', // 类型声明输出目录
      format: 'cjs',
      preserveModules: true, // 保留模块结构拆分
      preserveModulesRoot: 'packages',
      entryFileNames: '[name].d.ts', // 保持和源码文件名对应
    },
  ],
  plugins: [dts()],
  }))
];
