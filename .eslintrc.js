const path = require('path');

module.exports = {
  env: {
    es2021: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [['@src', path.resolve(__dirname, 'src')]],
        map: [['@lib', path.resolve(__dirname, 'src', 'lib')]]
      }
    }
  },
  plugins: [
    '@typescript-eslint'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended'
  ]
}
