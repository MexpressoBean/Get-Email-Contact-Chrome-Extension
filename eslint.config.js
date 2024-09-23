/** @type {import("eslint").Linter.Config} */
const config = {
    env: {
      browser: true,  // Enable browser globals
      es2021: true,   // Enable ES2021 features
    },
    extends: [
      'eslint:recommended', // Use the recommended rules
      'plugin:chrome/extensions' // Use Chrome extension-specific rules
    ],
    parserOptions: {
      ecmaVersion: 12, // Use the latest ECMAScript features
      sourceType: 'module', // Allow using ES modules
    },
    rules: {
      // Customize your rules here
      'no-console': 'warn', // Warn on console logs
      'no-unused-vars': 'warn', // Warn on unused variables
    },
  };
  
  module.exports = config;
  