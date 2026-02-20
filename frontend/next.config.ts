import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
    const backendBase = backendUrl.replace('/api/v1', '');
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`,
      },
      {
        source: "/docs",
        destination: `${backendBase}/docs`,
      },
      {
        source: "/openapi.json",
        destination: `${backendBase}/openapi.json`,
      },
    ];
  },
};

export default nextConfig;
