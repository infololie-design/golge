// v1.0.0 - CACHE KILLER
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Bekleme, hemen yüklen
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          console.log('Eski önbellek siliniyor:', key);
          return caches.delete(key);
        })
      );
    })
  );
  return self.clients.claim(); // Sayfanın kontrolünü hemen al
});

self.addEventListener('fetch', (event) => {
  // Asla önbellekten verme, her şeyi ağdan çek
  event.respondWith(fetch(event.request));
});
