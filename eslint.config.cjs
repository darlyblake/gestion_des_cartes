const js = require('@eslint/js')
const typescript = require('@typescript-eslint/eslint-plugin')
const typescriptParser = require('@typescript-eslint/parser')
const react = require('eslint-plugin-react')
const nextPlugin = require('@next/eslint-plugin-next')

module.exports = [
  {
    ignores: ['node_modules/', '.next/', 'out/', 'dist/', 'build/', '.vercel/']
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        React: 'readonly',
        JSX: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        File: 'readonly',
        FormData: 'readonly',
        fetch: 'readonly',
        URLSearchParams: 'readonly',
        btoa: 'readonly',
        HTMLElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLDivElement: 'readonly',
        KeyboardEvent: 'readonly',
        RequestInit: 'readonly',
        process: 'readonly',
        Buffer: 'readonly'
      }
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    plugins: {
      '@typescript-eslint': typescript,
      react,
      '@next/next': nextPlugin
    },
    rules: Object.assign({},
      js.configs.recommended.rules,
      typescript.configs.recommended.rules,
      react.configs.recommended.rules,
      nextPlugin.configs.recommended.rules,
      {
        'no-console': ['error', { allow: ['warn', 'error'] }],
        'no-debugger': 'error',
        'no-var': 'error',

        'react/jsx-key': 'error',
        'react/no-unescaped-entities': 'warn',
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',

        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': 'warn',
        '@typescript-eslint/no-empty-object-type': 'off',

        '@next/next/no-img-element': 'warn',

        'no-undef': 'off'
      }
    )
  }
]
