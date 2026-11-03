import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Cho phép truy cập dev resources & HMR từ điện thoại / thiết bị khác trong mạng LAN */
  allowedDevOrigins: [
    "192.168.1.230",
    "192.168.1.*",
    "192.168.*.*",
    "10.*.*.*",
    "localhost",
    "127.0.0.1",
  ],
  cacheComponents: true,
  partialPrefetching: true,
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
