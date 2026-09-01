import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { useAuth } from '../context/useAuth.js'
import { supabase } from '../lib/supabaseClient'

function filaACanje(fila) {
  return {
    id: fila.id,
    premioId: fila.premio_id,
    premioNombre: fila.premio_nombre,
    costoPuntos: fila.costo_puntos,
    fecha: fila.fecha,
    detalleOrigen: fila.detalle_origen,
    oculto: fila.oculto ?? false,
    fotoUrl: fila.foto_url,
  }
}

// Cache compartida entre todas las instancias de useCanjes() — ver el
// comentario equivalente en useMaterias.js: sin esto, confirmar un canje
// desde una pantalla no se reflejaba en otra (ej. el saldo del header)
// hasta recargar la página entera.
let cache = null
const listeners = new Set()

function actualizarCache(actualizador) {
  cache = actualizador(cache)
  listeners.forEach((listener) => listener())
}

function suscribirse(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function obtenerCache() {
  return cache
}

export function useCanjes() {
  const { usuario } = useAuth()
  const cacheActual = useSyncExternalStore(suscribirse, obtenerCache)

  const canjes = usuario && cacheActual?.usuarioId === usuario.id ? cacheActual.valor : []
  const cargando = Boolean(usuario) && cacheActual?.usuarioId !== usuario?.id

  useEffect(() => {
    if (!usuario) return
    if (cache?.usuarioId === usuario.id) return

    let cancelado = false

    supabase
      .from('canjes')
      .select('*')
      .eq('user_id', usuario.id)
      .then(({ data, error }) => {
        if (cancelado) return
        if (error) console.error(error)
        actualizarCache(() => ({ usuarioId: usuario.id, valor: (data ?? []).map(filaACanje) }))
      })

    return () => {
      cancelado = true
    }
  }, [usuario, cacheActual])

  // Se guarda una "foto" del nombre y costo del premio en ese momento: un
  // canje ya hecho no se revierte ni cambia aunque el premio se edite o
  // se borre después.
  const agregarCanje = useCallback(
    async (premio, detalleOrigen, fotoUrl) => {
      if (!usuario) return

      const fila = {
        user_id: usuario.id,
        premio_id: premio.id,
        premio_nombre: premio.nombre,
        costo_puntos: premio.costoPuntos,
        detalle_origen: detalleOrigen,
        foto_url: fotoUrl ?? null,
      }
      const { data, error } = await supabase.from('canjes').insert(fila).select().single()
      if (error) {
        console.error(error)
        return
      }
      actualizarCache((prev) => ({ usuarioId: usuario.id, valor: [...(prev?.valor ?? []), filaACanje(data)] }))
    },
    [usuario],
  )

  // "Borra" el historial completo del usuario (de todas las carreras, el
  // mismo conjunto que se ve en pantalla) sin devolver los puntos ya
  // gastados: en vez de eliminar las filas, las marca `oculto`. El saldo se
  // sigue calculando sobre TODOS los canjes (ocultos o no) — ver
  // calcularSaldoDisponible en utils/canjes.js, que no filtra por esto — así
  // que el gasto sigue contando igual. Las pantallas de historial son las
  // que filtran los ocultos para no mostrarlos.
  const ocultarHistorialCanjes = useCallback(async () => {
    if (!usuario) return

    const { error } = await supabase.from('canjes').update({ oculto: true }).eq('user_id', usuario.id)
    if (error) {
      console.error(error)
      return
    }
    actualizarCache((prev) => ({
      usuarioId: usuario.id,
      valor: prev.valor.map((canje) => ({ ...canje, oculto: true })),
    }))
  }, [usuario])

  return { canjes, cargando, agregarCanje, ocultarHistorialCanjes }
}
