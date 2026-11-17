import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.16'],
  async redirects() {
    return [
      // Old /businesses pages for group companies → corrected /group paths
      {
        source: "/businesses/qorve",
        destination: "/group/qorve",
        permanent: true,
      },
      {
        source: "/businesses/northgrid",
        destination: "/group/northgrid",
        permanent: true,
      },
      // /businesses catch-all → keep the page but redirect Qorve/Northgrid
      {
        source: "/businesses",
        destination: "/portfolio",
        permanent: false,
      },
    ];
  },
  transpilePackages: ["@virex/ui", "@virex/content"],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
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
