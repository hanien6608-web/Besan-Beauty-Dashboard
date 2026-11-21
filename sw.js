// Service Worker — Besan Beauty (لوحة الإدارة)
const CACHE_NAME = 'besan-admin-shell-v39';
const APP_START = './admin.html';
const SHELL_FILES = [
  './',
  './admin.html',
  './login.html',
  './config.js',
  './pwa.js',
  './admin_manifest.json',
  './logo-192.png',
  './logo-512.png',
  './logo.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_FILES.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith('besan-admin-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Network-first للملفات المحلية، مع الرجوع للنسخة المخزنة عند انقطاع الإنترنت.
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request, { cache: 'no-cache' }).then((response) => {
      if (response && response.ok && response.type === 'basic') {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    }).catch(async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (request.mode === 'navigate') {
        const path = new URL(request.url).pathname;
        return caches.match(path.endsWith('/login.html') ? './login.html' : APP_START);
      }
      return Response.error();
    })
  );
});

self.addEventListener('push', (event) => {
  let data = { title: 'Besan Beauty - الإدارة', body: 'لديكِ طلب أو رسالة جديدة ✨', url: APP_START };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (_) {
    if (event.data) data.body = event.data.text();
  }

  event.waitUntil(self.registration.showNotification(data.title || 'Besan Beauty - الإدارة', {
    body: data.body || 'لديكِ طلب أو رسالة جديدة ✨',
    icon: './logo-192.png',
    badge: './badge-96.png',
    tag: data.tag || ('besan-admin-' + Date.now()),
    renotify: true,
    data: { url: data.url || APP_START, type: data.type || '', phone: data.phone || '', orderId: data.orderId || null }
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  // Resolve against this app's own scope (same host also serves the storefront under another path).
  const scope = self.registration.scope;
  const rawUrl = event.notification.data?.url || APP_START;
  let target;
  try {
    target = new URL(rawUrl, scope);
    if (!target.href.startsWith(scope)) target = new URL(APP_START, scope);
  } catch (_) {
    target = new URL(APP_START, scope);
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      for (const client of windows) {
        if (client.url.startsWith(scope) && 'focus' in client) {
          return client.focus().then(() => client.navigate(target.href));
        }
      }
      return self.clients.openWindow ? self.clients.openWindow(target.href) : undefined;
    })
  );
});
