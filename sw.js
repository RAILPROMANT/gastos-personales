// Service Worker básico — cachea la app para uso offline
const CACHE = "gastos-v1";
const ASSETS = [
  "./",
  "./gastos.html",
  "./manifest.json",
  "./icon.png",
  "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"
];

// Instalar: cachear recursos
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

// Activar: limpiar cachés viejos
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: red primero, cache como fallback
// Excepción: Apps Script siempre va a la red (no se debe cachear)
self.addEventListener("fetch", e => {
  const url = e.request.url;
  // No interceptar llamadas a Apps Script ni otras APIs dinámicas
  if (url.includes("script.google.com") || url.includes("googleusercontent.com")) {
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cachear respuestas exitosas de GET
        if (e.request.method === "GET" && res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
