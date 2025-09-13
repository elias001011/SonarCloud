/// <reference lib="webworker" />

const CACHE_NAME = 'sonarcloud-cache-v2';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg',
  'https://w.soundcloud.com/player/api.js',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap'
];

// Install event: cache the application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: stale-while-revalidate strategy
self.addEventListener('fetch', (event) => {
    // Ignore SoundCloud audio streams, but cache the API script
    if (event.request.url.includes('soundcloud.com') && !event.request.url.includes('api.js')) {
        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    // If we get a valid response, update the cache
                    if (networkResponse && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(error => {
                    console.error('Fetch failed:', error);
                    // When fetch fails, we can return the cached response if it exists
                    // If not, the promise rejection will propagate.
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    throw error;
                });

                // Return cached response immediately if available, otherwise wait for the network response.
                return cachedResponse || fetchPromise;
            });
        })
    );
});
