const VERSION = '__BUILD_ID__'
const SHELL = `${VERSION}-shell`
const RUNTIME = `${VERSION}-runtime`
const SHELL_URLS = __PRECACHE__

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key)),
      )
      await self.clients.claim()
    })(),
  )
})

async function cachePut(cacheName, request, response) {
  if (!response || (response.status !== 200 && response.type !== 'opaque')) return
  const cache = await caches.open(cacheName)
  await cache.put(request, response)
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request)
          await cachePut(SHELL, '/index.html', fresh.clone())
          return fresh
        } catch {
          return (
            (await caches.match('/index.html')) ||
            (await caches.match('/')) ||
            new Response('Hors-ligne', { status: 503, headers: { 'Content-Type': 'text/plain' } })
          )
        }
      })(),
    )
    return
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request)
        const network = fetch(request)
          .then(async (response) => {
            await cachePut(RUNTIME, request, response.clone())
            return response
          })
          .catch(() => null)
        return cached || (await network) || Response.error()
      })(),
    )
    return
  }

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request)
        if (cached) return cached
        try {
          const response = await fetch(request)
          await cachePut(RUNTIME, request, response.clone())
          return response
        } catch {
          return Response.error()
        }
      })(),
    )
  }
})
