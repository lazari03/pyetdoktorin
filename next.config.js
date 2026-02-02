// next.config.js
const WebpackObfuscator = require('webpack-obfuscator');

module.exports = {
  images: {
    domains: [
      'tailwindcss.com',
      'pyetdoktorin-storage.fra1.digitaloceanspaces.com',
      'images.unsplash.com',
    ],
  },
  productionBrowserSourceMaps: false,
  webpack: (config, { isServer, dev }) => {
    if (!dev && !isServer) {
      config.plugins.push(
        new WebpackObfuscator(
          {
            compact: true,
            controlFlowFlattening: true,
            deadCodeInjection: true,
            stringArray: true,
            stringArrayEncoding: ['base64'],
            stringArrayThreshold: 0.75,
            silent: true,
          },
          ["**/node_modules/**", "**/*.map"] // exclude
        )
      );
    }
    return config;
  },
};
