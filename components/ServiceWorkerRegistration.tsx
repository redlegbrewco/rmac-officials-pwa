'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/service-worker.js', {
            scope: '/'
          });
          
          console.log('Service Worker registered successfully:', registration);
          
          // Listen for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // New update available
                    console.log('New content is available; please refresh.');
                  } else {
                    // Content is cached for the first time
                    console.log('Content is cached for offline use.');
                  }
                }
              });
            }
          });
          
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      });

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'BACKGROUND_SYNC') {
          console.log('Background sync message received:', event.data);
          // Trigger manual sync in your app
          window.dispatchEvent(new CustomEvent('background-sync', { detail: event.data }));
        }
        
        if (event.data && event.data.type === 'PENALTY_SYNCED') {
          // Notify user that queued penalty was synced
          window.dispatchEvent(new CustomEvent('penalty-synced', {
            detail: event.data.data
          }));
        }
      });
    }
  }, []);

  return null;
}
