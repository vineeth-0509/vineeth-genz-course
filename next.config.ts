import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "s3.us-west-2.amazonaws.com",
      },
    ],
  },

  eslint: {
    ignoreDuringBuilds: true, 
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
