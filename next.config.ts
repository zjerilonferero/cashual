import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
