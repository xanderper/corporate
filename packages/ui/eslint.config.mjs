import nextConfig from "@virex/eslint-config/next";

const config = [
  ...nextConfig,
  {
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
];

export default config;
