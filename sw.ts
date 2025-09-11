/// <reference lib="WebWorker" />

// Fix: Explicitly declare the type of `self` to `ServiceWorkerGlobalScope`.
// This resolves the TypeScript error where `self` was incorrectly inferred as
// `Window`, which does not have the `skipWaiting` method.
declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'sonarcloud-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/constants.ts',
  '/types.ts',
  '/manifest.webmanifest',
  '/public/icon.svg',
  'https://w.soundcloud.com/player/api.js'
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

// Activate event: clean up old caches if any
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});


// Fetch event: serve from cache first, then network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Not in cache - fetch from network
        return fetch(event.request);
      }
    )
  );
});
