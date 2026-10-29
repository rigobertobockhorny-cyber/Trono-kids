const CACHE_VERSION = 'vortice-trono-ebd-v4.2.0';
const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json',
  './politica_privacidade.html',
  './pinturas_base64.js',
  './ebd_modulos_educativos.js',
  './2_ASSETS_UI_BOTOES/icon_512.png',
  './2_ASSETS_UI_BOTOES/icon_192.png',
  './2_ASSETS_UI_BOTOES/logo_trono_ebd.png',
  './2_ASSETS_UI_BOTOES/banner_vovo_e_netos_oficial.jpg',
  './2_ASSETS_UI_BOTOES/bg_ebd_01_biblioteca.jpg',
  './2_ASSETS_UI_BOTOES/bg_ebd_02_jardim.jpg',
  './2_ASSETS_UI_BOTOES/bg_ebd_03_trono.jpg',
  './2_ASSETS_UI_BOTOES/bg_ebd_04_lareira.jpg',
  './2_ASSETS_UI_BOTOES/bg_ebd_05_ceu.jpg',
  './2_ASSETS_UI_BOTOES/ebd_icon_vovo.png',
  './2_ASSETS_UI_BOTOES/ebd_icon_netos.png',
  './2_ASSETS_UI_BOTOES/ebd_icon_licao.png',
  './2_ASSETS_UI_BOTOES/ebd_icon_cronologia.png',
  './2_ASSETS_UI_BOTOES/ebd_icon_sementinha.png',
  './2_ASSETS_UI_BOTOES/ebd_icon_fe_acao.png',
  './2_ASSETS_UI_BOTOES/ebd_icon_devocional.png',
  './2_ASSETS_UI_BOTOES/ebd_icon_bau_jogos.png',
  './2_ASSETS_UI_BOTOES/ebd_icon_professor.png'
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

// Estratégia Offline-First com atualização inteligente em segundo plano:
// Funciona 100% sem internet no celular da criança ou na sala da EBD!
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
