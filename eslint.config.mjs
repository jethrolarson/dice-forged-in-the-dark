// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  { ignores: ['build/**/*', 'eslint.config.mjs', 'vite.config.ts'] },
  {
    rules: {
      'object-shorthand': 2,
      'no-debugger': 1,
      '@typescript-eslint/indent': 0,
      '@typescript-eslint/no-unused-expressions': [
        2,
        { allowTernary: true, allowShortCircuit: true, enforceForJSX: true },
      ],
      '@typescript-eslint/strict-boolean-expressions': 0,
      '@typescript-eslint/promise-function-async': 0,
      '@typescript-eslint/unbound-method': 1,
      '@typescript-eslint/no-non-null-assertion': 1,
      '@typescript-eslint/explicit-function-return-type': 0,
      '@typescript-eslint/array-type': 0,
      '@typescript-eslint/naming-convention': 0,
      '@typescript-eslint/consistent-indexed-object-style': 0,
      'class-methods-use-this': 1,
      '@typescript-eslint/no-unused-vars': [
        1,
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      complexity: [1, 10],
      'comma-dangle': ['error', 'only-multiline'],
      'no-void': 0,
    },
  },
  {
    files: ['**/*.js'],
    ...tseslint.configs.disableTypeChecked,
  },
)
