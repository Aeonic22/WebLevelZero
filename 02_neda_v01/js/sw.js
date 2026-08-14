const CACHE_NAME = "WebLevelZero-v1"; // bump this up to force app update and cache refresh
const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/app.js"
];

// Install: cache essential files and skip waiting to take over immediately
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(URLS_TO_CACHE)
    ).then(() => self.skipWaiting()) // Take over immediately, don't wait for current tabs to close
  );
});

// Activate: clean up old cache versions and claim all clients
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log("Deleting old cache:", name);
            return caches.delete(name);
          })
      )
    ).then(() => self.clients.claim()) // Take over all open tabs immediately
  );
});

// Fetch: network-first for HTML (to get updates), cache-first for assets
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  
  // For HTML pages, try network first to get updates
  if (event.request.mode === "navigate" || url.pathname.endsWith(".html")) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful responses
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => caches.match(event.request)) // Fall back to cache if offline
    );
  } else {
    // For assets (CSS, JS, etc), use cache-first
    event.respondWith(
      caches.match(event.request).then(response =>
        response || fetch(event.request)
      )
    );
  }
});