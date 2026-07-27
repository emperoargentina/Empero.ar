const IMG_CACHE = 'empero-images-v2';
const ASSET_CACHE = 'empero-static-v1';
const CLOUDINARY_HOST = 'res.cloudinary.com';
const IMG_TTL_MS = 2 * 24 * 60 * 60 * 1000;
const STATIC_EXT = ['.js', '.css', '.woff', '.woff2', '.ttf'];

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key.startsWith('empero-images-') && key !== IMG_CACHE) return caches.delete(key);
          if (key.startsWith('empero-static-') && key !== ASSET_CACHE) return caches.delete(key);
        })
      )
    )
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.hostname.includes(CLOUDINARY_HOST)) {
    event.respondWith(cacheThenNetwork(event.request, IMG_CACHE));
    return;
  }

  if (url.origin === self.location.origin && STATIC_EXT.some(ext => url.pathname.endsWith(ext))) {
    event.respondWith(cacheStatic(event.request));
    return;
  }

  if (url.origin === self.location.origin && url.pathname === '/') {
    event.respondWith(cacheStatic(event.request));
    return;
  }
});

async function cacheThenNetwork(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    const metaKey = request.url + '_meta';
    const metaCached = await cache.match(metaKey);
    if (metaCached) {
      try {
        const meta = await metaCached.json();
        if (Date.now() - meta.timestamp < IMG_TTL_MS) return cached;
      } catch {}
    }
    cache.delete(request);
    cache.delete(request.url + '_meta');
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const clone = response.clone();
      cache.put(request, clone);
      cache.put(
        request.url + '_meta',
        new Response(JSON.stringify({ timestamp: Date.now() }), {
          headers: { 'Content-Type': 'application/json' },
        })
      );
    }
    return response;
  } catch {
    if (cached) return cached;
    return new Response('', { status: 503 });
  }
}

async function cacheStatic(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    if (cached) return cached;
    return new Response('', { status: 503 });
  }
}

self.addEventListener('message', (event) => {
  if (event.data?.type === 'purge-image-cache') {
    caches.keys().then((keys) => {
      keys.forEach((key) => {
        if (key.startsWith('empero-images-')) caches.delete(key);
        if (key.startsWith('empero-static-')) caches.delete(key);
      });
    });
  }
});
