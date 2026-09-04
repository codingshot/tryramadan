// Export post-processing: cache only the static app, never personal data or external requests.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, relative, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? walk(join(dir, entry.name)) : join(dir, entry.name)))).flat();
}
const htmlFile = resolve(root, 'index.html');
let html = await readFile(htmlFile, 'utf8');
html = html.replace('</head>', '<link rel="manifest" href="/manifest.webmanifest"><meta name="theme-color" content="#173e2d"></head>');
html = html.replace('</body>', '<script src="/register-sw.js" defer></script></body>');
await writeFile(htmlFile, html);
await writeFile(resolve(root, 'manifest.webmanifest'), JSON.stringify({
  id: '/', name: 'TryRamadan', short_name: 'TryRamadan', start_url: '/', scope: '/',
  display: 'standalone', background_color: '#f6f4eb', theme_color: '#173e2d',
  icons: [192, 512].map((size) => ({ src: `/icon-${size}.png`, sizes: `${size}x${size}`, type: 'image/png', purpose: 'any' })),
}));
await writeFile(resolve(root, 'register-sw.js'), "if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch((error) => console.warn('Offline installation unavailable', error)); }); }");
const files = (await walk(root)).filter((file) => !file.endsWith('/sw.js') && !file.endsWith('.map')).sort();
const hash = createHash('sha256');
for (const file of files) hash.update(relative(root, file)).update(await readFile(file));
const cache = `tryramadan-expo-${hash.digest('hex').slice(0, 16)}`;
const urls = files.map((file) => `/${relative(root, file).split('\\').join('/')}`);
await writeFile(resolve(root, 'sw.js'), `
const CACHE = ${JSON.stringify(cache)};
const FILES = ${JSON.stringify(urls)};
self.addEventListener('install', (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES))));
// A new version waits until all old tabs are closed: no forced reload or lost journal draft.
self.addEventListener('activate', (event) => event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('tryramadan-expo-') && key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.open(CACHE).then((cache) => cache.match('/index.html'))));
  } else if (FILES.includes(url.pathname)) {
    event.respondWith(caches.open(CACHE).then(async (cache) => (await cache.match(url.pathname)) || fetch(event.request)));
  }
});
`);
console.log(`PWA generated: ${files.length} assets in ${cache}`);
