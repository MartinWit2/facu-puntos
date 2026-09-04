// Service Worker de Unipoints — solo se ocupa de push notifications
// (recibir el push del servidor y manejar el click en la notificación).
// No hace cache de assets ni nada de offline-first: no es el objetivo acá.

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'Unipoints', body: event.data.text() }
  }

  const titulo = payload.title || 'Unipoints'
  const opciones = {
    body: payload.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: payload.url || '/' },
  }

  event.waitUntil(self.registration.showNotification(titulo, opciones))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si ya hay una pestaña de la app abierta, la reusa (enfocándola y
      // navegándola a la ruta del aviso) en vez de abrir una nueva.
      for (const client of clientList) {
        const clientUrl = new URL(client.url)
        if (clientUrl.origin === self.location.origin && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(url)
          } else {
            // Fallback si el navegador no soporta WindowClient.navigate():
            // el lado de la app escucha este mensaje (ver App.jsx) y hace la
            // navegación con React Router en vez de una recarga dura.
            client.postMessage({ type: 'navegar', url })
          }
          return client.focus()
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
    }),
  )
})
