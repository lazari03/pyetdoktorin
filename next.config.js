// next.config.js
let WebpackObfuscator = null;
try {
  // Optional dependency in some deploy environments
  WebpackObfuscator = require('webpack-obfuscator');
} catch (error) {
  WebpackObfuscator = null;
}

module.exports = {
  images: {
    domains: [
      'tailwindcss.com',
      'pyetdoktorin-storage.fra1.digitaloceanspaces.com',
      'images.unsplash.com',
    ],
  },
  productionBrowserSourceMaps: false,
  async redirects() {
    return [
      { source: "/en/:year/:month/:day/:slug*", destination: "/blog", permanent: true },
      { source: "/:year/:month/:day/:slug*", destination: "/blog", permanent: true },
      { source: "/rritja-e-aksesit-shendetesor", destination: "/blog", permanent: true },
      { source: "/menagjimi-i-semundjeve-kronike", destination: "/blog", permanent: true },
      { source: "/is-ʻoumuamua-still-debated-among-top-scientists", destination: "/blog", permanent: true },
      { source: "/en", destination: "/", permanent: true },
      { source: "/en/:path*", destination: "/:path*", permanent: true },
      { source: "/how-it-works", destination: "/si-funksionon", permanent: true },
      { source: "/faq", destination: "/help-center", permanent: true },
      { source: "/privacy", destination: "/privacy-policy", permanent: true },
      { source: "/terms", destination: "/terms-of-service", permanent: true },
      { source: "/kontakt", destination: "/contact", permanent: true },
      { source: "/cmimet", destination: "/pricing", permanent: true },
      { source: "/mjek-online", destination: "/konsulte-mjeku-online", permanent: true },
      { source: "/mjeku-online", destination: "/konsulte-mjeku-online", permanent: true },
      { source: "/recete-online", destination: "/recete-elektronike", permanent: true },
    ];
  },
  webpack: (config, { isServer, dev }) => {
    if (!dev && !isServer && WebpackObfuscator) {
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
