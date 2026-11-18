import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@virex/ui', '@virex/content'],
  cacheComponents: true
};

export default nextConfig;
