/// <reference lib="webworker" />
import { getOfflineMode } from './idb';

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'pgen-cache-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './manifest.json',
    './icons/pgen_ico_192.png',
    './icons/pgen_ico_512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        (async () => {
            const offlineMode = await getOfflineMode();
            const cache = await caches.open(CACHE_NAME);
            const cachedResponse = await cache.match(event.request);

            if (offlineMode) {
                // Cache First Strategy
                if (cachedResponse) {
                    return cachedResponse;
                }
                try {
                    const networkResponse = await fetch(event.request);
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                } catch (error) {
                    throw error;
                }
            } else {
                // Stale While Revalidate Strategy
                const networkFetch = fetch(event.request).then((res) => {
                    cache.put(event.request, res.clone());
                    return res;
                }).catch(err => {
                    // If network fails, we rely on cache purely.
                    console.warn('Network fetch failed', err);
                    // We don't return here as this is inside the promise chain for update
                });

                return cachedResponse || networkFetch as Promise<Response>;
            }
        })()
    );
});
