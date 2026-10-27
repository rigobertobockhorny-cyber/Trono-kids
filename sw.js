const CACHE_VERSION = 'vortice-trono-kids-v2.0.0';
const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json',
  './politica_privacidade.html',
  './pinturas_base64.js',
  './2_ASSETS_UI_BOTOES/logo_base_trono.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
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

// Network-First strategy: sempre busca a versão mais nova no servidor (Auto-Update Instantâneo!)
// Se estiver sem internet (offline), entrega o cache local salvo no celular.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
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
