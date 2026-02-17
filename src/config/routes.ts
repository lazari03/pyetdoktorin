// Centralized route and API endpoint constants for the app
// Security: Only export safe, non-secret values

export const ROUTES = {
  ROOT: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  CLINICIANS: '/clinicians',
  DOCTORS: '/doctors',
  INDIVIDUALS: '/individuals',
  PRICING: '/pricing',
  HELP_CENTER: '/help-center',
  JOBS: '/jobs',
  TERMS: '/terms-of-service',
  PRIVACY: '/privacy-policy',
  BLOG: '/blog',
  STATUS: '/status',
  ADMIN: '/admin',
  PHARMACY: '/pharmacy',
  CLINIC: '/clinic',
  DASHBOARD: '/dashboard',
};

export const API_ENDPOINTS = {
  HMS_BASE_URL: process.env.NEXT_PUBLIC_HMS_BASE_URL || 'https://api.100ms.live/v2',
  // Add more as needed
};
