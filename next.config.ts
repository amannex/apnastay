import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8888',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8888',
      },
      {
        protocol: 'https',
        hostname: 'cms.apnastay.in',
      }
    ],
  },
  reactStrictMode: false,
};

export default nextConfig;
