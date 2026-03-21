import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use Turbopack for faster builds
  experimental: {
    turbo: {},
  },

  // Image optimization — allow Supabase storage domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "supabase.co",
      },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/products",
        destination: "/algos",
        permanent: true,
      },
      {
        source: "/blogs",
        destination: "/blog",
        permanent: true,
      },
    ];
  },

  // Suppress specific warnings from vendor packages
  typescript: {
    ignoreBuildErrors: false,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
