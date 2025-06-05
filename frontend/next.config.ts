import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'bakeria-cakes.s3.ap-southeast-1.amazonaws.com',
      'bakeria-content-picture.s3.ap-southeast-1.amazonaws.com',
    ],
  },
  env: {
    ACCESS_KEY_ID: process.env.ACCESS_KEY_ID,
    SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY,
  },
};

export default nextConfig;