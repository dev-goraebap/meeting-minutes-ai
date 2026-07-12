import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Minimal, self-contained production build for the Docker image (ADR-0009).
  output: "standalone",
  experimental: {
    // Every request (including the multipart audio upload in
    // POST /api/meetings) passes through proxy.ts (ADR-0008's auth check),
    // and Next.js defaults to a 10MB cap on request bodies read there —
    // silently truncating anything larger, which corrupts the multipart
    // body and throws "Failed to parse body as FormData" downstream.
    // Match nginx's client_max_body_size for this domain (300m).
    proxyClientMaxBodySize: "300mb",
  },
};

export default nextConfig;
