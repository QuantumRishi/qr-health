import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: Removed 'output: "export"' to enable API routes and server-side functions
  // This is required for Resend email integration and dynamic backend calls
  // Static export would prevent API routes from working
};

export default nextConfig;
