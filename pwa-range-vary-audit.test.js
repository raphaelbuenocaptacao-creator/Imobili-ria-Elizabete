const fs = require('fs');

const source = fs.readFileSync('sw.js', 'utf8').toLowerCase();

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

console.log('Elizabete PWA range-vary cache safety verified');
