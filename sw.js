const CACHE_VERSION = 'vortice-trono-ebd-v79.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './2_ASSETS_UI_BOTOES/icon_512_oficial.png',
  './2_ASSETS_UI_BOTOES/icon_192_oficial.png',
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
  const url = event.request.url.toLowerCase();
  const isMedia = url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.webp') || url.includes('.mp3') || url.includes('pinturas_base64.js');

  if (isMedia) {
    event.respondWith(
      caches.open(CACHE_VERSION).then((cache) =>
        cache.match(event.request).then((cachedResp) => {
          if (cachedResp) return cachedResp;
          return fetch(event.request).then((netResp) => {
            if (netResp && netResp.status === 200) {
              cache.put(event.request, netResp.clone());
            }
            return netResp;
          });
        })
      )
    );
    return;
  }

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
