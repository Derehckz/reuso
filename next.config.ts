import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: "https", hostname: "reuso.cl" },
      { protocol: "https", hostname: "www.reuso.cl" },
      { protocol: "https", hostname: "re-uso.cl" },
      { protocol: "https", hostname: "www.re-uso.cl" },
      // Imágenes de catálogo / migración WordPress
      { protocol: "https", hostname: "reuso.dpcoding.cl" },
      { protocol: "https", hostname: "http2.mlstatic.com" },
      { protocol: "https", hostname: "*.mlstatic.com" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "16mb",
    },
  },
};

export default nextConfig;
