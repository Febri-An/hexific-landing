/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    resolveAlias: {
      // Exclude problematic packages
      'why-is-node-running': '',
    },
  },
  experimental: {
    serverComponentsExternalPackages: ['pino', 'pino-pretty'],
  },
};

module.exports = nextConfig;