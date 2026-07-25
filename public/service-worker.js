// NOTE: Service workers are intentionally conservative here.
// Caching HTML in Next.js apps can cause blank screens after deploys because
// stale cached HTML references old hashed chunk URLs. If you need offline/PWA,
// migrate this to a Workbox-based setup with a tested update strategy.

const CACHE_PREFIXES_TO_CLEAR = ['myapp-cache-', 'pyetdoktorin-cache-'];

self.addEventListener('install', (event) => {
  // Activate updated SW ASAP to clear old caches.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => CACHE_PREFIXES_TO_CLEAR.some((prefix) => key.startsWith(prefix)))
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    return;
  }
  event.waitUntil(
    self.registration.showNotification(payload.title || 'Pyet Doktorin', {
      body: payload.body || '',
      icon: '/apple-touch-icon.png',
      badge: '/apple-touch-icon.png',
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      if (clients.length > 0) return clients[0].focus();
      return self.clients.openWindow('/dashboard/notifications');
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Never interfere with Next.js assets or API routes.
  if (url.pathname.startsWith('/_next/') || url.pathname.startsWith('/api/')) {
    return;
  }

  // Network-first for navigations. No HTML caching.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(
        () =>
          new Response('Offline', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          })
      )
    );
    return;
  }

  // For other requests, just pass-through (avoid surprising caching bugs).
  event.respondWith(fetch(event.request));
});
