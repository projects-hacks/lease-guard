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
    // Strip /api/v1 or /api from backendUrl so we get just the host (e.g. http://96.126.99.75)
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
    const backendHost = backendUrl.replace(/\/api(\/v1)?$/, '');
    return [
      {
        // /api/v1/rent/analyze → http://96.126.99.75/api/v1/rent/analyze
        source: "/api/:path*",
        destination: `${backendHost}/api/:path*`,
      },
      {
        source: "/docs",
        destination: `${backendHost}/docs`,
      },
      {
        source: "/openapi.json",
        destination: `${backendHost}/openapi.json`,
      },
    ];
  },
};

export default nextConfig;
