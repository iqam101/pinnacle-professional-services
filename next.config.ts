import type { NextConfig } from "next";

const buildTarget = process.env.BUILD_TARGET || "";
const isStaticExport =
  buildTarget === "hostinger" || buildTarget === "cloudflare";

const nextConfig: NextConfig = {
  ...(isStaticExport
    ? {
        output: "export",
        trailingSlash: true,
      }
    : {
        serverExternalPackages: ["node:sqlite"],
      }),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    unoptimized: isStaticExport,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  ...(!isStaticExport
    ? {
        async headers() {
          return [
            {
              source: "/(.*)",
              headers: [
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "X-Frame-Options", value: "SAMEORIGIN" },
                {
                  key: "Referrer-Policy",
                  value: "strict-origin-when-cross-origin",
                },
              ],
            },
            {
              source: "/images/(.*)",
              headers: [
                {
                  key: "Cache-Control",
                  value: "public, max-age=2592000, stale-while-revalidate=86400",
                },
              ],
            },
          ];
        },
      }
    : {}),
};

export default nextConfig;
