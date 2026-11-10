const CACHE_VERSION = 'vortice-trono-ebd-v124.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './version.json',
  './ebd_super_arcade_audiovisual.js?v=124.0',
  './ebd_modulos_educativos.js?v=124.0',
  './2_ASSETS_UI_BOTOES/fundo_palacio_saul_3d.jpg?v=123',
  './2_ASSETS_UI_BOTOES/rei_saul_centro_v124.png?v=124',
  './2_ASSETS_UI_BOTOES/lanca_frontal_v123.png?v=123',
  './2_ASSETS_UI_BOTOES/davi_costas_v123.png?v=123',
  './2_ASSETS_UI_BOTOES/btn_jogo_04_lanca_saul.svg?v=112',
  './2_ASSETS_UI_BOTOES/nuvem_branca.svg?v=110',
  './2_ASSETS_UI_BOTOES/pombinha_branca_voando.svg?v=110',
  './2_ASSETS_UI_BOTOES/arca_de_noe_labirinto.svg?v=110',
  './manifest.json',
  './2_ASSETS_UI_BOTOES/icon_512_oficial.png',
  './2_ASSETS_UI_BOTOES/icon_192_oficial.png',
  './2_ASSETS_UI_BOTOES/logo_oficial_ebd_v50.png',
  './2_ASSETS_UI_BOTOES/logo_oficial_kids_v50.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(ASSETS_TO_CACHE).catch(() => {}))
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

  // version.json NUNCA vem de cache
  if (url.includes('version.json')) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }));
    return;
  }

  // NETWORK-FIRST UNIVERSAL QUANDO ONLINE (Garante 100% de atualização imediata no celular; cache só se cair a internet!)
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
