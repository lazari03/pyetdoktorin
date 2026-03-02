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
  async headers() {
    const headers = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      // Keep permissive enough for payments/video; tighten once CSP is enforced.
      { key: 'Permissions-Policy', value: 'geolocation=(), payment=()' },
    ];

    if (process.env.NODE_ENV === 'production') {
      headers.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload',
      });

      // Start with REPORT-ONLY CSP to avoid breaking production while we migrate inline scripts/styles.
      // Enable enforcement later once all scripts/styles are nonce/sha based.
      const cspReportOnly = [
        "default-src 'self'",
        "base-uri 'self'",
        "form-action 'self'",
        // Next currently relies on inline styles/scripts in some paths; keep report-only for visibility.
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https:",
        "font-src 'self' data: https:",
        "connect-src 'self' https: wss: http:",
        // Allow embedding 100ms meeting (iframe) and any payment checkout that might require it.
        "frame-src 'self' https:",
        "object-src 'none'",
        "report-to csp",
        "report-uri /api/csp-report",
      ].join('; ');
      headers.push({ key: 'Content-Security-Policy-Report-Only', value: cspReportOnly });
      headers.push({ key: 'Reporting-Endpoints', value: 'csp="/api/csp-report"' });
    }

    return [
      {
        source: '/:path*',
        headers,
      },
    ];
  },
  async redirects() {
    return [
      // Legacy WP-style blog URLs; constrain to numeric dates so we don't catch /api/* or other app routes.
      { source: "/en/:year(\\d{4})/:month(\\d{1,2})/:day(\\d{1,2})/:slug*", destination: "/blog", permanent: true },
      { source: "/:year(\\d{4})/:month(\\d{1,2})/:day(\\d{1,2})/:slug*", destination: "/blog", permanent: true },
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
