module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint-config-love',
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  rules: {
    'object-shorthand': 2,
    'no-debugger': 1,
    '@typescript-eslint/indent': 0,
    '@typescript-eslint/strict-boolean-expressions': 0,
    '@typescript-eslint/promise-function-async': 0,
    '@typescript-eslint/unbound-method': 1,
    '@typescript-eslint/no-non-null-assertion': 1,
    '@typescript-eslint/no-unused-vars': 1,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/naming-convention': 0,
    'class-methods-use-this': 1,
    '@typescript-eslint/member-delimiter-style': [
      1,
      { multiline: { delimiter: 'none' }, singleline: { delimiter: 'semi' } },
    ],
    complexity: [1, 10], // KISS
    'comma-dangle': ['error', 'only-multiline'],
    'prettier/prettier': [1, { endOfLine: 'auto' }],
    'no-void': 0,
  },
}
