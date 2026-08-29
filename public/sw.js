const APP_SHELL = [
  '/WebLevelZero/',
  '/WebLevelZero/manifest.json',
  '/WebLevelZero/icons/icon-192.png',
  '/WebLevelZero/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('weblevelzero-v1').then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request).catch(() => caches.match('/WebLevelZero/'));
    })
  );
});
