/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['tailwindcss.com', 'pyetdoktorin-storage.fra1.digitaloceanspaces.com', 'images.unsplash.com'],
  },
  productionBrowserSourceMaps: false,
};

module.exports = nextConfig;
