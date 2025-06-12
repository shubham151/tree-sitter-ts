import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config, { isServer }) {
    // Let Webpack handle `.node` using node-loader (for server-side only)
    config.module.rules.push({
      test: /\.node$/,
      use: "node-loader",
    });

    // Prevent bundling node-gyp helpers
    config.externals.push({
      "node-gyp-build": "commonjs node-gyp-build",
    });

    return config;
  },
};

export default nextConfig;
