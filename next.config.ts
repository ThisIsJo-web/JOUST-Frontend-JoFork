import type { NextConfig } from "next";

const hostIp = process.env.HOST_IP || '192.168.1.2';

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: [],
  allowedDevOrigins: [hostIp, `${hostIp}:3000`, `${hostIp}:4000`],
  experimental: {
    serverActions: {
      allowedOrigins: [
        `${hostIp}:3000`, 
        `${hostIp}:4000`, 
        `http://${hostIp}:3000`, 
        `http://${hostIp}:4000`
      ]
    }
  },
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        // In Docker, we must use the service name 'server' to reach the backend from the 'new' container
        destination: `http://server:4000/:path*`,
      },
    ];
  },
};

export default nextConfig;
