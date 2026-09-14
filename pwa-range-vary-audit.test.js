const fs = require('fs');

const sw = fs.readFileSync('sw.js', 'utf8');
const source = sw.toLowerCase();
const register = fs.readFileSync('pwa-register.js', 'utf8');
const manifest = JSON.parse(fs.readFileSync('manifest.webmanifest', 'utf8'));

if (!source.includes("request.headers.has('range')") || !source.includes("request.headers.has('if-range')")) {
  throw new Error('sw.js: Range and If-Range requests must bypass cache');
}

if (!source.includes('content-range')) {
  throw new Error('sw.js: Content-Range responses must be rejected');
}

const unsafeVaryBlock = source.match(/function\s+hasunsafevary\s*\([^)]*\)\s*\{([\s\S]*?)\n\}/);
if (!unsafeVaryBlock) throw new Error('sw.js: hasUnsafeVary not found');

if (!unsafeVaryBlock[1].includes("key==='range'") || !unsafeVaryBlock[1].includes("key==='if-range'")) {
  throw new Error('sw.js: Vary: Range and Vary: If-Range must be rejected from cache');
}

if (manifest.display !== 'standalone') throw new Error('manifest: display must be standalone');
if (!manifest.start_url || !manifest.scope) throw new Error('manifest: start_url and scope are required');
const icon192 = manifest.icons?.find(icon => icon.sizes === '192x192' && icon.type === 'image/png');
const icon512 = manifest.icons?.find(icon => icon.sizes === '512x512' && icon.type === 'image/png' && icon.purpose === 'any');
const maskable512 = manifest.icons?.find(icon => icon.sizes === '512x512' && icon.type === 'image/png' && icon.purpose?.includes('maskable'));
if (!icon192 || !icon512 || !maskable512) throw new Error('manifest: 192, 512 and maskable PNG icons are required');
for (const icon of [icon192, icon512, maskable512]) {
  const path = icon.src.replace(/^\.\//, '');
  if (!fs.existsSync(path)) throw new Error(`manifest: missing icon ${path}`);
}

if (!register.includes("updateViaCache: 'none'")) throw new Error('pwa-register: updateViaCache must be none');
if (!register.includes("document.addEventListener('visibilitychange'")) throw new Error('pwa-register: must check updates on foreground');
if (!register.includes("navigator.serviceWorker.addEventListener('controllerchange'")) throw new Error('pwa-register: must hand off to a new controller');
if (!register.includes('navigator.serviceWorker.controller')) throw new Error('pwa-register: first install must be distinguished from update');
if (!register.includes("postMessage({ type: 'SKIP_WAITING' })")) throw new Error('pwa-register: waiting worker must be promoted safely');

console.log('Elizabete PWA cache, manifest and update lifecycle verified');
