import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["module/**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        foundry: "readonly",
        game: "readonly",
        CONFIG: "readonly",
        Hooks: "readonly",
        ui: "readonly",
        Actor: "readonly",
        Item: "readonly",
        ChatMessage: "readonly",
        Roll: "readonly"
      }
    }
  }
];
