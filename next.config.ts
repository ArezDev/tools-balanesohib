import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // EsLinting disable
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
