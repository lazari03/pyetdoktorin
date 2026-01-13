const CACHE_NAME = 'myapp-cache-v2';
const urlsToCache = [
  '/',
  '/img/logo.png',
  '/manifest.json',
  '/favicon.ico',
  '/globals.css',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
});

self.addEventListener('fetch', event => {
  // Skip non-GET requests and API/auth requests
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // Don't cache API routes, auth requests, or Firebase requests
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/') ||
    url.hostname.includes('firebase') ||
    url.hostname.includes('googleapis')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      return fetch(event.request).catch(() => {
        // Return a fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
        // For other requests, just fail silently
        return new Response('', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});
