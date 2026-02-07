// Next.js configuration for clean architecture
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable TypeScript and React strict mode
  reactStrictMode: true,
  swcMinify: true,

  // Path aliases for clean architecture imports
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/domain': './src/clean/src/domain',
      '@/application': './src/clean/src/application',
      '@/infrastructure': './src/clean/src/infrastructure',
      '@/presentation': './src/clean/src/presentation',
    };

    return config;
  },

  // Experimental features
  experimental: {
    serverComponentsExternalPackages: ['firebase', 'firebase-admin'],
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Redirects for backward compatibility
  async redirects() {
    return [
      {
        source: '/old-appointments',
        destination: '/clean-appointments',
        permanent: true,
      },
    ];
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Output configuration
  output: 'standalone',

  // TypeScript configuration
  typescript: {
    tsconfigPath: './tsconfig.json',
  },

  // Eslint configuration
  eslint: {
    dirs: ['src', 'src/clean'],
  },
};

module.exports = nextConfig;