import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  // Les URLs de l'API Django exigent le slash final — ne pas le normaliser.
  skipTrailingSlashRedirect: true,
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
