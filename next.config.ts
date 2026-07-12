import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Minimal, self-contained production build for the Docker image (ADR-0009).
  output: "standalone",
};

export default nextConfig;
