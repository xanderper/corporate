import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    ignores: [".next/**", ".test-build/**", "out/**", "build/**", "next-env.d.ts"],
  },
];

export default config;
