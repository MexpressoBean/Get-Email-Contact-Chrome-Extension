import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser, // Adds browser-specific globals like window, document, etc.
        ...globals.webextensions, // Adds globals like 'chrome' for Chrome extensions
      },
    },
  },
  pluginJs.configs.recommended,
];
