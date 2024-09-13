const CACHE_NAME = "finasteride_app_cache";
const ROOT = "/public/finasteride"
const cached = [
  `${ROOT}/index.html`,
  `${ROOT}/main.js`,
  `${ROOT}/style.css`,
  `${ROOT}/dist/elm.js`,
  `${ROOT}/asset/mainImage.jpg`,
  `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined`
];

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
