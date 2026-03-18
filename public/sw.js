// Service Worker pour l'application School Card
// Utilise Workbox pour la mise en cache automatique

const CACHE_NAME = 'school-card-app-v1';
const STATIC_CACHE_NAME = 'school-card-static-v1';
const DYNAMIC_CACHE_NAME = 'school-card-dynamic-v1';

// Fichiers à mettre en cache statique
const STATIC_ASSETS = [
  '/',
  '/eleves',
  '/personnel',
  '/cartes',
  '/classes',
  '/etablissements',
  '/_next/static/css/',
  '/_next/static/chunks/',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Installation du service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installation...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Mise en cache des assets statiques');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installation terminée');
        return self.skipWaiting();
      })
  );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activation...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Suppression de l\'ancien cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation terminée');
        return self.clients.claim();
      })
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Stratégie de cache pour les assets statiques
  if (url.origin === location.origin) {
    if (url.pathname.includes('/_next/static/') || url.pathname.includes('/icons/')) {
      event.respondWith(
        caches.match(request)
          .then((response) => {
            return response || fetch(request);
          })
      );
      return;
    }
  }

  // Stratégie Network First pour les requêtes API
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Mettre en cache uniquement les réponses réussies
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Essayer le cache en cas d'échec réseau
          return caches.match(request);
        })
    );
    return;
  }

  // Stratégie Cache First pour les pages
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          return response || fetch(request);
        })
    );
    return;
  }

  // Pour les autres requêtes, utiliser la stratégie Network First
  event.respondWith(
    fetch(request)
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Gestion des messages pour la mise à jour du cache
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_UPDATE') {
    console.log('Service Worker: Mise à jour du cache demandée');
    event.waitUntil(
      caches.open(STATIC_CACHE_NAME)
        .then((cache) => {
          return cache.addAll(STATIC_ASSETS);
        })
    );
  }
});

// Nettoyage périodique du cache
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_CLEANUP') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE_NAME)
        .then((cache) => {
          return cache.keys()
            .then((requests) => {
              return Promise.all(
                requests.map((request) => {
                  const cacheEntry = cache.match(request);
                  return cacheEntry.then((response) => {
                    if (response) {
                      const dateHeader = response.headers.get('date');
                      if (dateHeader) {
                        const entryDate = new Date(dateHeader);
                        const now = new Date();
                        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 jours
                        
                        if (now - entryDate > maxAge) {
                          return cache.delete(request);
                        }
                      }
                    }
                      return Promise.resolve();
                    });
                  });
                })
              );
            })
        })
    );
  }
});
