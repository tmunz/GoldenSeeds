module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
    es6: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
    'jsx-a11y',
    'react-hooks',
    '@typescript-eslint',
  ],
  ignorePatterns: ['**/build/*.js', '**/node-modules/*'],
  rules: {
    indent: ['error', 2],
    'eol-last': ['error', 'always'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'no-explicit-any': 'off',
  },
};
