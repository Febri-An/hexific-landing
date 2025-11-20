import type { NextConfig } from "next";

const nextConfig: NextConfig= {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
  experimental: {
    serverComponentsExternalPackages: ['adm-zip'],
  },
};

export default nextConfig;
