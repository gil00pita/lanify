import eslint from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import nextVitals from 'eslint-config-next/core-web-vitals'
import perfectionist from 'eslint-plugin-perfectionist'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import reactHooks from 'eslint-plugin-react-hooks'
import { defineConfig } from 'eslint/config'
import fs from 'fs'
import path from 'path'

// Resolve candidate tsconfig locations (relative to process.cwd())
const candidates = [
  path.resolve(process.cwd(), 'tsconfig.json'),
  path.resolve(process.cwd(), 'src', 'tsconfig.json'),
]

const foundTsconfig = candidates.find((p) => fs.existsSync(p))

export default defineConfig([
  ...nextVitals,
  eslint.configs.recommended,
  {
    ignores: ['node_modules', 'build', 'dist', 'coverage'],
  },

  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: {
        __dirname: 'readonly',
        afterEach: 'readonly',
        beforeEach: 'readonly',
        clearInterval: 'readonly',
        clearTimeout: 'readonly',
        console: 'readonly',
        describe: 'readonly',
        document: 'readonly',
        expect: 'readonly',
        fetch: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        it: 'readonly',
        jest: 'readonly',
        module: 'readonly',
        MutationObserver: 'readonly',
        navigator: 'readonly',
        process: 'readonly',
        require: 'readonly',
        setInterval: 'readonly',
        setTimeout: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        window: 'readonly',
      },
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      perfectionist,
      'react-hooks': reactHooks,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-unused-expressions': [
        'warn',
        { allowShortCircuit: true, allowTernary: true },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*', '../../*'],
              message:
                'Use absolute imports (e.g. "@/components/...") instead of relative parent imports.',
            },
          ],
        },
      ],
      'no-undef': 'error',
      'no-unused-vars': 'off',
      // perfectionist/unicorn rules (kept from your original)
      'perfectionist/sort-enums': 'error',
      'perfectionist/sort-exports': 'error',
      'perfectionist/sort-imports': 'error',
      'perfectionist/sort-jsx-props': 'error',
      'perfectionist/sort-named-imports': 'error',
      'perfectionist/sort-objects': [
        'error',
        {
          ignoreCase: true,
          order: 'asc',
          type: 'alphabetical',
        },
      ],

      'react/react-in-jsx-scope': 'off',
    },
  },
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ...(foundTsconfig
          ? {
              project: foundTsconfig,
              tsconfigRootDir: process.cwd(),
            }
          : {}),
        ecmaFeatures: { jsx: true },
      },
    },
  },

  prettierRecommended,
])
