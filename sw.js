// Service Worker — auto-actualización
const CACHE_VERSION = "v3";
const CACHE_NAME = "gastos-" + CACHE_VERSION;

const ASSETS = [
  "./",
  "./gastos.html",
  "./manifest.json",
  "./icon.png",
  "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = e.request.url;
  if (url.includes("script.google.com") || url.includes("googleusercontent.com")) return;
  if (e.request.method !== "GET") return;

  const isHTML = e.request.mode === "navigate" || url.endsWith(".html") || url.endsWith(".js");

  if (isHTML) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(cached => {
        return cached || fetch(e.request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone)).catch(() => {});
          }
          return res;
        });
      })
    );
  }
});

self.addEventListener("message", e => {
  if (e.data === "skipWaiting") self.skipWaiting();
});
