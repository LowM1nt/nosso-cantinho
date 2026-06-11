// Service worker: o CÓDIGO (html/js/css) busca sempre da rede sem cache, pra ela
// pegar a versão nova na hora. Mídia (mp3/imagens/fontes) segue o cache normal do
// navegador, pra não re-baixar arquivos pesados a cada visita.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const isMedia = /\.(mp3|wav|ogg|png|jpe?g|svg|gif|webp|woff2?|ttf)(\?|$)/i.test(e.request.url);
  if (isMedia) return; // deixa o navegador cachear mídia normalmente
  e.respondWith(
    fetch(e.request, { cache: 'no-store' }).catch(() => caches.match(e.request))
  );
});
