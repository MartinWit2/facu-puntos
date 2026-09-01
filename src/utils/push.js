import { supabase } from '../lib/supabaseClient'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

// Todo lo que hace falta para que el navegador soporte push (no confundir
// con "el usuario ya está suscripto" — eso se chequea aparte).
export function pushSoportado() {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && Boolean(VAPID_PUBLIC_KEY)
}

// iOS Safari necesita la app agregada a la pantalla de inicio (16.4+) para
// que Web Push funcione — en una pestaña normal del navegador no hay forma
// de suscribirse. Se usa para decidir si avisarle al usuario en vez de
// dejar que el flujo falle en silencio.
export function esIOS() {
  return (
    /iP(hone|od|ad)/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

export function corriendoStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

export async function registrarServiceWorker() {
  if (!('serviceWorker' in navigator)) return null
  try {
    return await navigator.serviceWorker.register('/sw.js')
  } catch (error) {
    console.error('No se pudo registrar el service worker', error)
    return null
  }
}

// pushManager.subscribe pide la clave VAPID como Uint8Array, no como el
// string base64url que da `web-push generate-vapid-keys`.
function claveVapidComoBytes(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

export async function suscripcionActual() {
  if (!('serviceWorker' in navigator)) return null
  const registration = await navigator.serviceWorker.getRegistration()
  if (!registration) return null
  return registration.pushManager.getSubscription()
}

// Pide permiso, suscribe al navegador contra el push service, y guarda la
// suscripción en Supabase. Devuelve la suscripción o null si el permiso se
// denegó (en ese caso no queda nada suscripto ni guardado).
export async function activarPush(userId) {
  const permiso = await Notification.requestPermission()
  if (permiso !== 'granted') return null

  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: claveVapidComoBytes(VAPID_PUBLIC_KEY),
  })

  const json = subscription.toJSON()
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      { user_id: userId, endpoint: json.endpoint, p256dh: json.keys.p256dh, auth_key: json.keys.auth },
      { onConflict: 'endpoint' },
    )
  if (error) throw error

  return subscription
}

// Desuscribe del navegador y borra la fila de push_subscriptions
// correspondiente (por endpoint, que es único).
export async function desactivarPush() {
  const registration = await navigator.serviceWorker.getRegistration()
  const subscription = await registration?.pushManager.getSubscription()
  if (!subscription) return

  const endpoint = subscription.endpoint
  await subscription.unsubscribe()
  await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)
}
