import { defineConfig } from 'oxfmt'

export default defineConfig({
  arrowParens: 'always',
  endOfLine: 'lf',
  ignorePatterns: ['dist', 'playwright-report', 'test-results', 'package-lock.json'],
  insertFinalNewline: true,
  printWidth: 120,
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  useTabs: false,
})
