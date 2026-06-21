import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Disable the sharp-based image optimizer: it needs a native binary that often
  // fails on shared/cPanel hosting. Images are served as-is instead.
  images: {
    unoptimized: true,
  },
  // Force Next file-tracing to bundle the Prisma client + native query engine
  // (.so.node) files into .next/standalone. Without this, Next 16 often fails to
  // trace them and the server throws "could not locate the Query Engine".
  outputFileTracingIncludes: {
    "/": [
      "./node_modules/.prisma/client/**/*",
      "./node_modules/@prisma/client/**/*",
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
