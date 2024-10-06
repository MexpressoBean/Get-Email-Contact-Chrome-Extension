import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser, // Adds browser-specific globals like window, document, etc.
        ...globals.webextensions, // Adds globals like 'chrome' for Chrome extensions
        importScripts: "readonly", // Adds importScripts as a global
        CONFIG: "readonly", // Adds CONFIG as a global if it exists globally
      },
    },
  },
  pluginJs.configs.recommended,
];
