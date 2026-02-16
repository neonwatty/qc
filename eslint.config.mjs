import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import security from 'eslint-plugin-security'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

export default tseslint.config(
  {
    ignores: ['dist', '.next', 'ios', 'node_modules', 'out', 'playwright-report'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  security.configs.recommended,
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'max-lines': ['error', 300],
      'max-lines-per-function': ['error', 150],
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  prettier,
)
