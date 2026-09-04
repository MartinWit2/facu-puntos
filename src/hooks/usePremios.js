import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { useAuth } from '../context/useAuth.js'
import { supabase } from '../lib/supabaseClient'

function filaAPremio(fila) {
  return {
    id: fila.id,
    nombre: fila.nombre,
    categoria: fila.categoria,
    costoPuntos: fila.costo_puntos,
    imagenUrl: fila.imagen_url,
  }
}

// Cache compartida entre todas las instancias de usePremios() — ver el
// comentario equivalente en useMaterias.js: sin esto, agregar/editar un
// premio desde una pantalla no se reflejaba en otra (ej. el saldo del
// header) hasta recargar la página entera.
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

// Ver invalidarCacheMaterias en useMaterias.js.
export function invalidarCachePremios() {
  actualizarCache(() => null)
}

export function usePremios() {
  const { usuario } = useAuth()
  const cacheActual = useSyncExternalStore(suscribirse, obtenerCache)

  const premios = usuario && cacheActual?.usuarioId === usuario.id ? cacheActual.valor : []
  const cargando = Boolean(usuario) && cacheActual?.usuarioId !== usuario?.id

  useEffect(() => {
    if (!usuario) return
    if (cache?.usuarioId === usuario.id) return

    let cancelado = false

    supabase
      .from('premios')
      .select('*')
      .eq('user_id', usuario.id)
      .then(({ data, error }) => {
        if (cancelado) return
        if (error) console.error(error)
        actualizarCache(() => ({ usuarioId: usuario.id, valor: (data ?? []).map(filaAPremio) }))
      })

    return () => {
      cancelado = true
    }
  }, [usuario, cacheActual])

  const agregarPremio = useCallback(
    async (datos) => {
      if (!usuario) return

      const fila = {
        user_id: usuario.id,
        nombre: datos.nombre,
        categoria: datos.categoria,
        costo_puntos: datos.costoPuntos,
        imagen_url: datos.imagenUrl ?? null,
      }
      const { data, error } = await supabase.from('premios').insert(fila).select().single()
      if (error) {
        console.error(error)
        return
      }
      actualizarCache((prev) => ({ usuarioId: usuario.id, valor: [...(prev?.valor ?? []), filaAPremio(data)] }))
    },
    [usuario],
  )

  const editarPremio = useCallback(async (id, datos) => {
    const fila = {}
    if (datos.nombre !== undefined) fila.nombre = datos.nombre
    if (datos.categoria !== undefined) fila.categoria = datos.categoria
    if (datos.costoPuntos !== undefined) fila.costo_puntos = datos.costoPuntos
    if (datos.imagenUrl !== undefined) fila.imagen_url = datos.imagenUrl

    const { data, error } = await supabase.from('premios').update(fila).eq('id', id).select().single()
    if (error) {
      console.error(error)
      return
    }
    actualizarCache((prev) => ({
      usuarioId: prev.usuarioId,
      valor: prev.valor.map((p) => (p.id === id ? filaAPremio(data) : p)),
    }))
  }, [])

  const eliminarPremio = useCallback(async (id) => {
    const { error } = await supabase.from('premios').delete().eq('id', id)
    if (error) {
      console.error(error)
      return
    }
    actualizarCache((prev) => ({ usuarioId: prev.usuarioId, valor: prev.valor.filter((p) => p.id !== id) }))
  }, [])

  return { premios, cargando, agregarPremio, editarPremio, eliminarPremio }
}
