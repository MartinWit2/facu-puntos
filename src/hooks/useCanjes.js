import { useCallback, useState, useEffect } from 'react'
import { useAuth } from '../context/useAuth.js'
import { supabase } from '../lib/supabaseClient'

function filaACanje(fila) {
  return {
    id: fila.id,
    premioId: fila.premio_id,
    premioNombre: fila.premio_nombre,
    costoPuntos: fila.costo_puntos,
    fecha: fila.fecha,
  }
}

export function useCanjes() {
  const { usuario } = useAuth()
  const [cache, setCache] = useState(null)

  const canjes = usuario && cache?.usuarioId === usuario.id ? cache.valor : []
  const cargando = Boolean(usuario) && cache?.usuarioId !== usuario?.id

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
        setCache({ usuarioId: usuario.id, valor: (data ?? []).map(filaACanje) })
      })

    return () => {
      cancelado = true
    }
  }, [usuario, cache])

  // Se guarda una "foto" del nombre y costo del premio en ese momento: un
  // canje ya hecho no se revierte ni cambia aunque el premio se edite o
  // se borre después.
  const agregarCanje = useCallback(
    async (premio) => {
      if (!usuario) return

      const fila = {
        user_id: usuario.id,
        premio_id: premio.id,
        premio_nombre: premio.nombre,
        costo_puntos: premio.costoPuntos,
      }
      const { data, error } = await supabase.from('canjes').insert(fila).select().single()
      if (error) {
        console.error(error)
        return
      }
      setCache((prev) => ({ usuarioId: usuario.id, valor: [...(prev?.valor ?? []), filaACanje(data)] }))
    },
    [usuario],
  )

  return { canjes, cargando, agregarCanje }
}
