import js from '@eslint/js';
import globals from 'globals';
import pluginJest from 'eslint-plugin-jest';

export default [
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**', 'coverage/**', '*.config.{mjs,cjs}'],
  },
  {
    files: ['**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': 'warn',
      'no-console': 'off',
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': 'warn',
      'no-console': 'off',
    },
  },

  // jest
  {
    files: ['**/__tests__/**/*.js', '**/*.test.js'],
    plugins: {
      jest: pluginJest,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest, //
      },
    },
    rules: {
      ...pluginJest.configs.recommended.rules, //
    },
  },
];
