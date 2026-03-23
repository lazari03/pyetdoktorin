// next.config.js
let WebpackObfuscator = null;
try {
  // Optional dependency in some deploy environments
  WebpackObfuscator = require('webpack-obfuscator');
} catch (error) {
  WebpackObfuscator = null;
}

module.exports = {
  serverExternalPackages: ['firebase-admin', '@google-cloud/firestore', 'google-auth-library'],

  distDir: process.env.NEXT_DIST_DIR || (process.env.NODE_ENV === 'production' ? '.next' : '.next-dev'),

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'tailwindcss.com' },
      { protocol: 'https', hostname: 'pyetdoktorin-storage.fra1.digitaloceanspaces.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },

  productionBrowserSourceMaps: false,

  async headers() {
    const headers = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Permissions-Policy', value: 'geolocation=(), payment=()' },
    ];
    if (process.env.NODE_ENV === 'production') {
      headers.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload',
      });
    }
    return [{ source: '/:path*', headers }];
  },

  async redirects() {
    return [
      // ── Legacy WP-style blog date URLs ──────────────────────────────────
      { source: "/en/:year(\\d{4})/:month(\\d{1,2})/:day(\\d{1,2})/:slug*", destination: "/blog", permanent: true },
      { source: "/:year(\\d{4})/:month(\\d{1,2})/:day(\\d{1,2})/:slug*",    destination: "/blog", permanent: true },

      // ── Old pOrtokalle / WP blog slugs ───────────────────────────────────
      { source: "/rritja-e-aksesit-shendetesor",                             destination: "/blog", permanent: true },
      { source: "/menagjimi-i-semundjeve-kronike",                           destination: "/blog", permanent: true },
      // Fixed: special character ʻ encoded to avoid redirect error
      { source: "/is-%CA%BBoumuamua-still-debated-among-top-scientists",     destination: "/blog", permanent: true },
      { source: "/is-oumuamua-still-debated-among-top-scientists",           destination: "/blog", permanent: true },

      // ── WordPress common 404s ─────────────────────────────────────────────
      { source: "/wp-content/:slug*",  destination: "/", permanent: true },
      { source: "/wp-admin/:slug*",    destination: "/", permanent: true },
      { source: "/wp-login.php",       destination: "/", permanent: true },
      { source: "/feed",               destination: "/blog", permanent: true },
      { source: "/feed/:slug*",        destination: "/blog", permanent: true },
      { source: "/sitemap_index.xml",  destination: "/sitemap.xml", permanent: true },
      { source: "/blog/category/:slug*", destination: "/blog", permanent: true },
      { source: "/blog/tag/:slug*",    destination: "/blog", permanent: true },
      { source: "/blog/page/:slug*",   destination: "/blog", permanent: true },
      { source: "/author/:slug*",      destination: "/blog", permanent: true },
      { source: "/page/:slug*",        destination: "/", permanent: true },

      // ── Language / locale ─────────────────────────────────────────────────
      { source: "/en",                 destination: "/", permanent: true },
      { source: "/en/:path*",          destination: "/:path*", permanent: true },
      { source: "/sq/:path*",          destination: "/:path*", permanent: true },
      { source: "/al/:path*",          destination: "/:path*", permanent: true },

      // ── Albanian slug aliases ─────────────────────────────────────────────
      { source: "/how-it-works",       destination: "/si-funksionon", permanent: true },
      { source: "/faq",                destination: "/help-center", permanent: true },
      { source: "/privacy",            destination: "/privacy-policy", permanent: true },
      { source: "/terms",              destination: "/terms-of-service", permanent: true },
      { source: "/kontakt",            destination: "/contact", permanent: true },
      { source: "/cmimet",             destination: "/pricing", permanent: true },
      { source: "/mjek-online",        destination: "/konsulte-mjeku-online", permanent: true },
      { source: "/mjeku-online",       destination: "/konsulte-mjeku-online", permanent: true },
      { source: "/recete-online",      destination: "/recete-elektronike", permanent: true },
      { source: "/about-us",           destination: "/about", permanent: true },
      { source: "/rreth-nesh",         destination: "/about", permanent: true },
      { source: "/na-kontaktoni",      destination: "/contact", permanent: true },
      { source: "/sherbime",           destination: "/services", permanent: true },
      { source: "/cmime",              destination: "/pricing", permanent: true },
    ];
  },

  webpack: (config, { isServer, dev }) => {
    const enableClientObfuscation = process.env.NEXT_ENABLE_CLIENT_OBFUSCATION === 'true';

    if (dev) {
      config.cache = false;
    }
    // Client-side obfuscation significantly increases bundle size and parse/compile time,
    // which hurts Core Web Vitals and Lighthouse scores. Keep it opt-in for special builds only.
    if (!dev && !isServer && enableClientObfuscation && WebpackObfuscator) {
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
          ["**/node_modules/**", "**/*.map"]
        )
      );
    }
    return config;
  },
};
