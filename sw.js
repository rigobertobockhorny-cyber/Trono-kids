const CACHE_VERSION = 'vortice-trono-ebd-v113.0';
const ASSETS_TO_CACHE = [
  './2_ASSETS_UI_BOTOES/btn_jogo_04_lanca_saul.svg?v=111',
  './2_ASSETS_UI_BOTOES/lanca_bronze.svg?v=111',
  './2_ASSETS_UI_BOTOES/saul_arremessando.svg?v=111',
  './2_ASSETS_UI_BOTOES/davi_pulando.svg?v=111',
  './2_ASSETS_UI_BOTOES/davi_agachado.svg?v=111',
  './2_ASSETS_UI_BOTOES/davi_em_pe.svg?v=111',
  './2_ASSETS_UI_BOTOES/nuvem_raio.svg?v=108',
  './2_ASSETS_UI_BOTOES/nuvem_chuva.svg?v=108',
  './2_ASSETS_UI_BOTOES/nuvem_cinza.svg?v=108',
  './2_ASSETS_UI_BOTOES/nuvem_branca.svg?v=108',
  './2_ASSETS_UI_BOTOES/pombinha_branca_voando.svg?v=108',
  './2_ASSETS_UI_BOTOES/arca_de_noe_labirinto.svg?v=108',
  './',
  './index.html',
  './ebd_super_arcade_audiovisual.js?v=111.0',
  './ebd_modulos_educativos.js?v=111.0',
  './manifest.json',
  './2_ASSETS_UI_BOTOES/icon_512_oficial.png',
  './2_ASSETS_UI_BOTOES/icon_192_oficial.png',
  './2_ASSETS_UI_BOTOES/logo_oficial_ebd_v50.png',
  './2_ASSETS_UI_BOTOES/logo_oficial_kids_v50.png',
  './2_ASSETS_UI_BOTOES/fundo_pesca_maravilhosa_3d.jpg?v=95',
  './2_ASSETS_UI_BOTOES/fundo_dracma_perdida_3d.jpg?v=107',
  './6_ASSETS_AUDIO/jogos_vovo/som_splash_agua.mp3?v=104'
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

  // Mídias (Imagens, Áudios, Fontes): Cache-First ultra veloz
  const isMedia = url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.webp') || url.includes('.svg') || url.includes('.mp3') || url.includes('fonts.googleapis') || url.includes('gstatic');

  if (isMedia) {
    event.respondWith(
      caches.match(event.request).then((cachedResp) => {
        if (cachedResp) return cachedResp;
        return fetch(event.request).then((netResp) => {
          if (netResp && netResp.status === 200) {
            const clone = netResp.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
          }
          return netResp;
        }).catch(() => null);
      })
    );
    return;
  }

  // Scripts e Páginas: Stale-While-Revalidate (Resposta instantânea do cache + atualização em segundo plano)
  event.respondWith(
    caches.match(event.request).then((cachedResp) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const cloned = networkResponse.clone();
          caches.open(CACHE_VERSION).then((cache) => {
            cache.put(event.request, cloned);
          });
        }
        return networkResponse;
      }).catch(() => cachedResp);

      return cachedResp || fetchPromise;
    })
  );
});
