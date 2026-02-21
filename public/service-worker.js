const CACHE_VERSION = 'v2';
const STATIC_CACHE = `static-cache-${CACHE_VERSION}`;
const API_CACHE = `api-cache-${CACHE_VERSION}`;
const AUDIO_CACHE = `audio-cache-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== API_CACHE && k !== AUDIO_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Helper: network-first for APIs, cache-first for others
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET
  if (request.method !== 'GET') return;

  // Audio requests (Quran.com audio files) - cache first, then network
  if (
    url.hostname.includes('verses.quran.com') ||
    url.hostname.includes('audio') ||
    url.pathname.endsWith('.mp3')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((res) => {
            if (res && res.status === 200) {
              const resClone = res.clone();
              caches.open(AUDIO_CACHE).then((cache) => cache.put(request, resClone));
            }
            return res;
          })
          .catch(() => null);
      })
    );
    return;
  }

  // API requests (quran APIs) - network first then cache
  if (
    url.hostname.includes('quran.com') ||
    url.hostname.includes('quranenc.com') ||
    url.hostname.includes('nominatim.openstreetmap.org') ||
    url.hostname.includes('raw.githubusercontent.com') ||
    url.pathname.startsWith('/api/')
  ) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          // clone and store in cache
          const resClone = res.clone();
          caches.open(API_CACHE).then((cache) => cache.put(request, resClone));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // For navigation requests (SPA routing) - try cache, then network, fallback to cached index
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).catch(() => caches.match('/index.html')))
    );
    return;
  }

  // For other static assets - cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((res) => {
          // don't cache opaque responses
          if (!res || res.status !== 200 || res.type === 'opaque') return res;
          const resClone = res.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, resClone));
          return res;
        })
        .catch(() => {
          // fallback for images
          if (request.destination === 'image') return caches.match('/logo192.png');
          return null;
        });
    })
  );
});
