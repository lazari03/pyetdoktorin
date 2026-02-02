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
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'same-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' https://www.paypal.com https://www.gstatic.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https://www.paypalobjects.com https://images.unsplash.com https://pyetdoktorin-storage.fra1.digitaloceanspaces.com",
              "connect-src 'self' https://firestore.googleapis.com https://firebasestorage.googleapis.com https://www.paypal.com",
              "frame-src https://www.paypal.com",
              "object-src 'none'",
            ].join('; ')
          }
        ]
      }
    ];
  },
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
