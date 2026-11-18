import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  ...tseslint.configs.recommended,
  prettier,
  {
    ignores: ["dist/**", "node_modules/**"],
  },
];

export default config;
