(() => {
  if (!('serviceWorker' in navigator)) return;
  const secure = location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname);
  if (!secure) return;

  async function ensureRegistration() {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js', {
        scope: './',
        updateViaCache: 'none'
      });
      await registration.update();
      return registration;
    } catch (error) {
      console.warn('[Elizabete PWA] service worker registration failed', error);
      return null;
    }
  }

  window.addEventListener('load', ensureRegistration, { once: true });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') ensureRegistration();
  });
  window.addEventListener('online', ensureRegistration);
})();
