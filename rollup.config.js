
import dts from 'rollup-plugin-dts';

export default [
  {
    input: 'packages/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es'
    },
    plugins: [dts()],
  }
];
