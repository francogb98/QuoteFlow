import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "d4r7slnh-3000.brs.devtunnels.ms", // Agrega tu URL de tunnel
      ],
    },
    optimizeCss: true,
  },
};

export default nextConfig;
