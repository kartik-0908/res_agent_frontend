import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env:{
    AUTH_SECRET: process.env.AUTH_SECRET,
    AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    POSTGRES_URL: process.env.POSTGRES_URL,
    AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT,
    RESEARCH_AGENT_URL: process.env.RESEARCH_AGENT_URL,
    REDIS_URL: process.env.REDIS_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
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
