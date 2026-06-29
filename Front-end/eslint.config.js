import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

const nodeServerFiles = [
  'src/server.js',
  'src/config/**/*.js',
  'src/controllers/**/*.js',
  'src/middlewares/**/*.js',
  'src/models/**/*.js',
  'src/routes/**/*.js',
  'src/utils/seeder.js',
]

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: nodeServerFiles,
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
      sourceType: 'commonjs',
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    files: ['**/*.{js,jsx}'],
    ignores: nodeServerFiles,
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
