/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config: any, { isServer }: any) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    
    // Exclude test files from bundling
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules/,
      exclude: /node_modules\/.*\/test\//,
      use: ['ignore-loader'],
    });

    return config;
  },
};

module.exports = nextConfig;