import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

const legacyIgnores = [
  'dist',
  'src/components/premium/IrisReelsStage.jsx',
]

const sharedRules = {
  // React 19 uses the automatic JSX runtime; unused React imports are harmless.
  'no-unused-vars': ['warn', { varsIgnorePattern: '^React$', argsIgnorePattern: '^_' }],
  'no-empty': 'warn',
  'no-useless-assignment': 'warn',
  'react-hooks/set-state-in-effect': 'warn',
  'react-hooks/exhaustive-deps': 'warn',
  'react-hooks/purity': 'warn',
  'react-refresh/only-export-components': 'warn',
}

export default defineConfig([
  globalIgnores(legacyIgnores),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    rules: sharedRules,
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: sharedRules,
  },
])
