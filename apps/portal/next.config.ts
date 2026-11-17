import type { NextConfig } from "next";
import { resolve } from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@qorve/react", "@qorve/schemas", "@qorve/sdk", "@qorve/types"],
  // @qorve/react is linked in from a sibling repo (../../../qorve), outside
  // this monorepo's own tree — both bundlers need to be told that's allowed.
  experimental: {
    externalDir: true,
  },
  allowedDevOrigins: ['192.168.1.16'],
  turbopack: {
    root: resolve(__dirname, "../../../../"),
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:3004 https://checkout.qorve.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' http://localhost:3001 http://localhost:3004 https://api.qorve.com https://checkout.qorve.com; frame-src http://localhost:3004 https://checkout.qorve.com;",
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
