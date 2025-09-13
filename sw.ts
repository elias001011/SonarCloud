// Fix: The reference library name must be lowercase 'webworker' for TypeScript to correctly identify the service worker scope.
/// <reference lib="webworker" />

// Fix: Removed the conflicting redeclaration of `self`. The reference directive above provides the correct types.

const CACHE_NAME = 'sonarcloud-cache-v1';
// Corrected the list of URLs to cache for offline functionality.
// Removed source files (.ts/.tsx) and fixed the icon path.
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg',
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
      // Fix: Cast `self` to `any` to call `skipWaiting()`. TypeScript is failing to infer the correct Service Worker scope for `self`.
      .then(() => (self as any).skipWaiting())
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