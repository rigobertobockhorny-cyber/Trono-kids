const CACHE_VERSION = 'vortice-trono-ebd-v120.0';
const ASSETS_TO_CACHE = [
  './2_ASSETS_UI_BOTOES/fundo_palacio_saul_3d.jpg?v=120',
  './2_ASSETS_UI_BOTOES/davi_pastor_3d.png?v=120',
  './2_ASSETS_UI_BOTOES/rei_saul_3d.png?v=120',
  './2_ASSETS_UI_BOTOES/lanca_real_3d.png?v=120',
  './2_ASSETS_UI_BOTOES/btn_jogo_04_lanca_saul.svg?v=114',
  './2_ASSETS_UI_BOTOES/lanca_bronze.svg?v=114',
  './2_ASSETS_UI_BOTOES/saul_arremessando.svg?v=114',
  './2_ASSETS_UI_BOTOES/davi_pulando.svg?v=114',
  './2_ASSETS_UI_BOTOES/davi_agachado.svg?v=114',
  './2_ASSETS_UI_BOTOES/davi_em_pe.svg?v=114',
  './2_ASSETS_UI_BOTOES/nuvem_raio.svg?v=114',
  './2_ASSETS_UI_BOTOES/nuvem_chuva.svg?v=114',
  './2_ASSETS_UI_BOTOES/nuvem_cinza.svg?v=114',
  './2_ASSETS_UI_BOTOES/nuvem_branca.svg?v=114',
  './2_ASSETS_UI_BOTOES/pombinha_branca_voando.svg?v=114',
  './2_ASSETS_UI_BOTOES/arca_de_noe_labirinto.svg?v=114',
  './',
  './index.html',
  './ebd_super_arcade_audiovisual.js?v=115.0',
  './ebd_modulos_educativos.js?v=115.0',
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
            console.log('[SW] Apagando cache antigo:', key);
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

  // 1. PÁGINA HTML / NAVEGAÇÃO: NETWORK-FIRST OBRIGATÓRIO!
  // Garante que o tablet SEMPRE baixa a versão atualizada da nuvem quando online!
  const isHtml = event.request.mode === 'navigate' || url.endsWith('/') || url.includes('index.html');
  if (isHtml) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then((netResp) => {
          if (netResp && netResp.status === 200) {
            const clone = netResp.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(event.request, clone));
          }
          return netResp;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 2. SCRIPTS JS PRINCIPAIS: NETWORK-FIRST COM FALLBACK PARA CACHE
  // Evita que celulares e tablets fiquem com versões antigas do código!
  const isCoreScript = url.includes('ebd_super_arcade') || url.includes('ebd_modulos');
  if (isCoreScript) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then((netResp) => {
          if (netResp && netResp.status === 200) {
            const clone = netResp.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(event.request, clone));
          }
          return netResp;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 3. MÍDIAS (Imagens, Áudios, Fontes): Cache-First rápido
  const isMedia = url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.webp') || url.includes('.svg') || url.includes('.mp3') || url.includes('fonts.googleapis') || url.includes('gstatic');

  if (isMedia) {
    event.respondWith(
      caches.match(event.request).then((cachedResp) => {
        if (cachedResp) return cachedResp;
        return fetch(event.request, { cache: 'no-store' }).then((netResp) => {
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

  // Demais requisições
  event.respondWith(
    caches.match(event.request).then((cachedResp) => {
      const fetchPromise = fetch(event.request, { cache: 'no-store' }).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const cloned = networkResponse.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, cloned));
        }
        return networkResponse;
      }).catch(() => cachedResp);

      return fetchPromise || cachedResp;
    })
  );
});
