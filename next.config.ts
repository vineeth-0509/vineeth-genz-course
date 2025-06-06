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
    ignoreDuringBuilds: true, // ✅ disables ESLint on build
  },

  typescript: {
    ignoreBuildErrors: true, // ✅ disables TypeScript type checking on build
  },
};

export default nextConfig;
