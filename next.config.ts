import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── Security headers ────────────────────────────────────────────────────
  async headers() {
    return [
      // Never cache QR redirect routes — destination can change at any time
      {
        source: "/r/:slug",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // ─── Build optimizations ─────────────────────────────────────────────────
  // Remove console.log in production (keep error/warn)
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  // ─── Image optimization ──────────────────────────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // ─── Experimental ────────────────────────────────────────────────────────
  experimental: {
    // Optimize package imports for smaller bundles
    optimizePackageImports: ["@clerk/nextjs", "convex"],
  },
};

export default nextConfig;
