const CACHE_VERSION = 'vortice-trono-ebd-v168.0';
const CORE_SHELL = [
  './',
  './index.html'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(CORE_SHELL).catch(() => {}))
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

  // 1. NUNCA intercepta streaming de vídeo/áudio (.mp4, .mp3, .wav) nem Range requests (206)!
  // Deixa o decoder nativo C++ do celular tocar a vinheta e os áudios sem zero engasgo!
  const url = event.request.url.toLowerCase();
  if (event.request.headers.has('range') || /\.(mp4|mp3|wav|ogg|webm)(\?|$)/i.test(url)) {
    return;
  }

  // 2. version.json sempre direto da rede sem cache
  if (url.includes('version.json')) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }

  // 3. Imagens, ícones e fontes (.png, .jpg, .svg, .webp, .woff2): CACHE-FIRST ULTRA-RÁPIDO!
  if (/\.(png|jpg|jpeg|webp|svg|gif|ico|woff2?|ttf)(\?|$)/i.test(url)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((netResp) => {
          if (netResp && netResp.status === 200) {
            const clone = netResp.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(event.request, clone)).catch(() => {});
          }
          return netResp;
        });
      })
    );
    return;
  }

  // 4. HTML, JS e CSS: NETWORK-FIRST para receber qualquer atualização de código na hora!
  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then((netResp) => {
        if (netResp && netResp.status === 200) {
          const clone = netResp.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(event.request, clone)).catch(() => {});
        }
        return netResp;
      })
      .catch(() => caches.match(event.request))
  );
});
