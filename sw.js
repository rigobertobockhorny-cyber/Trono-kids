const CACHE_VERSION = 'vortice-trono-ebd-v57.0';
const ASSETS_TO_CACHE = [
  './index.html?v=57',
  './manifest.json?v=57',
  './2_ASSETS_UI_BOTOES/icon_512_v57.png',
  './2_ASSETS_UI_BOTOES/icon_192_v57.png',
  './2_ASSETS_UI_BOTOES/logo_oficial_ebd_v50.png',
  './2_ASSETS_UI_BOTOES/logo_oficial_kids_v50.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => caches.delete(k)))
    ).then(() =>
      caches.open(CACHE_VERSION).then((cache) => cache.addAll(ASSETS_TO_CACHE).catch(() => {}))
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_VERSION) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request, { cache: 'no-cache' })
      .then((networkResponse) => {
        const cloned = networkResponse.clone();
        caches.open(CACHE_VERSION).then((cache) => {
          cache.put(event.request, cloned);
        });
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
