(() => {
  if (!('serviceWorker' in navigator)) return;
  const secure = location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname);
  if (!secure) return;

  const hadController = Boolean(navigator.serviceWorker.controller);
  let refreshing = false;

  function promoteWaiting(registration) {
    if (hadController && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  async function ensureRegistration() {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js?v=v10-private-vary-range-safe-shell', {
        scope: './',
        updateViaCache: 'none'
      });

      promoteWaiting(registration);
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed') promoteWaiting(registration);
        });
      });

      await registration.update();
      promoteWaiting(registration);
      return registration;
    } catch (error) {
      console.warn('[Elizabete PWA] service worker registration failed', error);
      return null;
    }
  }

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || refreshing) return;
    refreshing = true;
    location.reload();
  });

  window.addEventListener('load', ensureRegistration, { once: true });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') ensureRegistration();
  });
  window.addEventListener('online', ensureRegistration);
})();
