// BIBLIO 3D Service Worker
const CACHE_NAME = 'biblio3d-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Pass-through fetch without altering credentials or throwing 401
self.addEventListener('fetch', (event) => {
  // Let the browser handle standard network requests natively
  return;
});
