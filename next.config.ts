import type { NextConfig } from "next";

const hostIp = process.env.HOST_IP || '192.168.1.2';

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: [],
  allowedDevOrigins: [hostIp],
  experimental: {
    serverActions: {
      allowedOrigins: [`${hostIp}:3000`, `${hostIp}:4000`]
    }
  }
};

export default nextConfig;

