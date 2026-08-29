const CACHE_NAME = 'weblevelzero-v2'; // bump this to force clients onto a fresh cache

const APP_SHELL = [
  '/WebLevelZero/',
  '/WebLevelZero/manifest.json',
  '/WebLevelZero/icons/icon-192.png',
  '/WebLevelZero/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const isHTML = event.request.mode === 'navigate' ||
    event.request.headers.get('accept')?.includes('text/html');
  const isBuildId = event.request.url.endsWith('/build-id.txt');

  if (isHTML || isBuildId) {
    // Network-first: for HTML so a fresh deploy is picked up immediately
    // (cached hashed assets referenced by a stale shell may no longer
    // exist), and for build-id.txt so it never reports a stale build.
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/WebLevelZero/')))
    );
    return;
  }

  // Cache-first for hashed/static assets: they're immutable per URL.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
