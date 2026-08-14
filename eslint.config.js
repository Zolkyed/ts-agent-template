import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  {
    ignores: ["dist/", "build/", "node_modules/", "coverage/"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      // Both Node and browser globals recognized by default — drop this into
      // a Node-only or browser-only project unchanged; delete whichever half
      // doesn't apply if you want stricter no-undef coverage.
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
  },
);
