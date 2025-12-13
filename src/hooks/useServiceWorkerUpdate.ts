import { useEffect } from 'react';

export const useServiceWorkerUpdate = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Check for updates every 30 seconds
      const checkInterval = setInterval(() => {
        navigator.serviceWorker.getRegistration().then((registration) => {
          if (registration) {
            registration.update();
          }
        });
      }, 30000);

      // Listen for controller change (new SW activated)
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          console.log('New version available, reloading...');
          window.location.reload();
        }
      });

      // Handle waiting service worker
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          // Skip waiting immediately
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content available, skip waiting
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              }
            });
          }
        });
      });

      return () => clearInterval(checkInterval);
    }
  }, []);
};
