var CACHE_NAME = "finasteride_app_cache";
var cached = ['../index.html', '../main.js', '../style.css', '../dist/elm.js', '../asset/mainImage.jpg'];

// install
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(cached);
    })
  );
});

// load cache
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response ? response : fetch(event.request);
    })
  );
});
