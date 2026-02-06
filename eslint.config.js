import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import vitest from 'eslint-plugin-vitest';
import tseslint from 'typescript-eslint';

const vitestGlobals = {
  describe: 'readonly',
  it: 'readonly',
  test: 'readonly',
  expect: 'readonly',
  beforeEach: 'readonly',
  afterEach: 'readonly',
  beforeAll: 'readonly',
  afterAll: 'readonly',
  vi: 'readonly',
};

export default defineConfig(
  {
    ignores: [
      'node_modules/',
      'es/',
      'cjs/',
      'dist/',
      'playground/',
      '.trae/',
      'prettier.config.cjs',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'prefer-const': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
  {
    files: ['tests/**/*.ts', 'vitest.config.ts', 'vitest.setup.ts'],
    plugins: {
      vitest,
    },
    languageOptions: {
      globals: {
        ...vitestGlobals,
      },
    },
    rules: {
      ...vitest.configs.recommended.rules,
    },
  },
  eslintPluginPrettierRecommended,
);
