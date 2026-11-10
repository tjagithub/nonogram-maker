import { defineConfig } from 'oxlint'

export default defineConfig({
  categories: {
    correctness: 'error',
    suspicious: 'warn',
  },
  ignorePatterns: ['dist', 'playwright-report', 'test-results'],
  plugins: ['typescript', 'oxc', 'react'],
  rules: {
    'react-hooks/exhaustive-deps': 'warn',
    'react/purity': 'warn',
    'react/react-in-jsx-scope': 'off',
    'react/set-state-in-effect': 'warn',
  },
})
