// zippee-frontend - File public/service-worker.js - v1

const CACHE_NAME = 'zippee-traveler-v1';
const urlsToCache = [
    '/',
    '/enduser/trip',
    '/welcome',
    '/static/js/main.chunk.js',
    '/static/css/main.chunk.css',
    '/logo192.png',
    '/logo512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});