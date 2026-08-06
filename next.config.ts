import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: "next-dist",
  async redirects() {
    return [
      { source: "/favicon.ico", destination: "/icon", permanent: true },
    ];
  },
};

export default nextConfig;
