const CACHE_NAME = 'rmac-officials-v1';
const PENALTY_QUEUE_NAME = 'penalty-queue';

// Cache essential app files
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  // Add more critical assets as needed
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Handle penalty sync requests
  if (event.request.url.includes('/api/sync-penalties')) {
    event.respondWith(handlePenaltySync(event.request));
    return;
  }

  // Handle other requests
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // If offline and no cache, return offline page
        if (event.request.destination === 'document') {
          return new Response(
            '<html><body><h1>Offline</h1><p>App is working offline. Data will sync when connection returns.</p></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        }
      })
  );
});

// Handle penalty sync with offline queue
async function handlePenaltySync(request) {
  try {
    // Try to sync immediately
    const response = await fetch(request);
    if (response.ok) {
      // Process any queued penalties
      await processQueuedPenalties();
      return response;
    }
    throw new Error('Sync failed');
  } catch (error) {
    // Queue penalty for later sync
    const penaltyData = await request.json();
    await queuePenalty(penaltyData);
    
    // Return success response (optimistic)
    return new Response(JSON.stringify({
      success: true,
      queued: true,
      message: 'Penalty queued for sync when online'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Queue penalty in IndexedDB
async function queuePenalty(penaltyData) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RMACOffline', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([PENALTY_QUEUE_NAME], 'readwrite');
      const store = transaction.objectStore(PENALTY_QUEUE_NAME);
      
      const queueItem = {
        id: Date.now(),
        data: penaltyData,
        timestamp: new Date().toISOString(),
        retryCount: 0
      };
      
      store.add(queueItem);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PENALTY_QUEUE_NAME)) {
        db.createObjectStore(PENALTY_QUEUE_NAME, { keyPath: 'id' });
      }
    };
  });
}

// Process queued penalties when online
async function processQueuedPenalties() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RMACOffline', 1);
    
    request.onsuccess = async () => {
      const db = request.result;
      const transaction = db.transaction([PENALTY_QUEUE_NAME], 'readonly');
      const store = transaction.objectStore(PENALTY_QUEUE_NAME);
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = async () => {
        const queuedItems = getAllRequest.result;
        
        for (const item of queuedItems) {
          try {
            const response = await fetch('/api/sync-penalties', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item.data)
            });
            
            if (response.ok) {
              // Remove from queue on success
              await removeFromQueue(item.id);
              
              // Notify main thread
              self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                  client.postMessage({
                    type: 'PENALTY_SYNCED',
                    data: item.data
                  });
                });
              });
            }
          } catch (error) {
            console.error('Failed to sync queued penalty:', error);
            // Could implement retry logic with exponential backoff
          }
        }
        resolve();
      };
    };
  });
}

// Remove item from queue
async function removeFromQueue(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RMACOffline', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([PENALTY_QUEUE_NAME], 'readwrite');
      const store = transaction.objectStore(PENALTY_QUEUE_NAME);
      
      store.delete(id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };
  });
}

// Background sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'penalty-sync') {
    event.waitUntil(processQueuedPenalties());
  }
});

// Message event for manual sync
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_PENALTIES') {
    processQueuedPenalties();
  }
});
