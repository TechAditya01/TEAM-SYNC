const CACHE_NAME = 'nagar-alert-hub-v1';
const STATIC_CACHE = 'nagar-alert-hub-static-v1';
const DYNAMIC_CACHE = 'nagar-alert-hub-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/icon-light-32x32.png',
  '/icon-dark-32x32.png',
  '/apple-icon.png',
  '/placeholder.jpg',
  '/placeholder.svg',
  '/placeholder-user.jpg',
  '/placeholder-logo.png',
  '/placeholder-logo.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[ServiceWorker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests
  if (url.origin !== location.origin) return;

  // Handle API requests differently
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached API response if available
          return caches.match(request);
        })
    );
    return;
  }

  // Handle static assets and pages
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response.ok) return response;

            const responseClone = response.clone();

            // Cache the response
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });

            return response;
          })
          .catch(() => {
            // Return offline fallback for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/');
            }
          });
      })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync triggered:', event.tag);

  if (event.tag === 'background-sync-alerts') {
    event.waitUntil(syncPendingAlerts());
  }
});

// Function to sync pending alerts when back online
async function syncPendingAlerts() {
  try {
    // Get all pending alerts from IndexedDB or localStorage
    const pendingAlerts = await getPendingAlerts();

    for (const alert of pendingAlerts) {
      try {
        const response = await fetch('/api/alerts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(alert)
        });

        if (response.ok) {
          // Remove from pending alerts
          await removePendingAlert(alert.id);
          console.log('[ServiceWorker] Synced alert:', alert.id);
        }
      } catch (error) {
        console.error('[ServiceWorker] Failed to sync alert:', alert.id, error);
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Background sync failed:', error);
  }
}

// Helper functions for managing pending alerts
async function getPendingAlerts() {
  // This would typically use IndexedDB
  // For now, return empty array as placeholder
  return [];
}

async function removePendingAlert(id) {
  // This would typically remove from IndexedDB
  console.log('[ServiceWorker] Would remove pending alert:', id);
}

// Push notification handling (placeholder)
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push received:', event);

  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon.svg',
      badge: '/icon.svg',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification click:', event);
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});

console.log('[ServiceWorker] Loaded successfully');
