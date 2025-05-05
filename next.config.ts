import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env:{
    AUTH_SECRET: process.env.AUTH_SECRET,
  },
  experimental: {
    ppr: false,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
};

export default nextConfig;
