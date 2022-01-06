module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  extends: [
    'standard-with-typescript',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  rules: {
    'object-shorthand': 2,
    'no-debugger': 1,
    '@typescript-eslint/strict-boolean-expressions': 0,
    '@typescript-eslint/promise-function-async': 0,
    '@typescript-eslint/unbound-method': 1,
    '@typescript-eslint/no-non-null-assertion': 1,
    '@typescript-eslint/no-unused-vars': 1,
    '@typescript-eslint/member-delimiter-style': [
      1,
      { multiline: { delimiter: 'none' }, singleline: { delimiter: 'semi' } },
    ],
    '@typescript-eslint/explicit-function-return-type': [
      1,
      { allowTypedFunctionExpressions: true, allowHigherOrderFunctions: true },
    ],
    complexity: [1, 10], // KISS
    'comma-dangle': ['error', 'only-multiline'],
    'prettier/prettier': [2, { endOfLine: 'auto' }],
    'no-void': [0],
  },
}
