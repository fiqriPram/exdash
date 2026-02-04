import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: output: "export" is disabled to support dynamic API routes
  // This enables: /api/auth/*, /api/upload, /api/report/*, etc.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
