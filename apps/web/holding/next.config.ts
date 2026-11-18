import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.16'],
  async redirects() {
    return [
      // Pages merged into /group and /about in the 2026 redesign
      { source: "/companies", destination: "/group", permanent: true },
      { source: "/ownership", destination: "/group", permanent: true },
      { source: "/governance", destination: "/about", permanent: true },
      { source: "/businesses", destination: "/group", permanent: true },
      { source: "/businesses/:company", destination: "/group", permanent: true },
      { source: "/group/:company", destination: "/group", permanent: false },
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
