import { useCallback, useState, useEffect } from 'react'
import { useAuth } from '../context/useAuth.js'
import { supabase } from '../lib/supabaseClient'

function filaAPremio(fila) {
  return { id: fila.id, nombre: fila.nombre, categoria: fila.categoria, costoPuntos: fila.costo_puntos }
}

export function usePremios() {
  const { usuario } = useAuth()
  const [cache, setCache] = useState(null)

  const premios = usuario && cache?.usuarioId === usuario.id ? cache.valor : []
  const cargando = Boolean(usuario) && cache?.usuarioId !== usuario?.id

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
        setCache({ usuarioId: usuario.id, valor: (data ?? []).map(filaAPremio) })
      })

    return () => {
      cancelado = true
    }
  }, [usuario, cache])

  const agregarPremio = useCallback(
    async (datos) => {
      if (!usuario) return

      const fila = {
        user_id: usuario.id,
        nombre: datos.nombre,
        categoria: datos.categoria,
        costo_puntos: datos.costoPuntos,
      }
      const { data, error } = await supabase.from('premios').insert(fila).select().single()
      if (error) {
        console.error(error)
        return
      }
      setCache((prev) => ({ usuarioId: usuario.id, valor: [...(prev?.valor ?? []), filaAPremio(data)] }))
    },
    [usuario],
  )

  const editarPremio = useCallback(async (id, datos) => {
    const fila = {}
    if (datos.nombre !== undefined) fila.nombre = datos.nombre
    if (datos.categoria !== undefined) fila.categoria = datos.categoria
    if (datos.costoPuntos !== undefined) fila.costo_puntos = datos.costoPuntos

    const { data, error } = await supabase.from('premios').update(fila).eq('id', id).select().single()
    if (error) {
      console.error(error)
      return
    }
    setCache((prev) => ({ usuarioId: prev.usuarioId, valor: prev.valor.map((p) => (p.id === id ? filaAPremio(data) : p)) }))
  }, [])

  const eliminarPremio = useCallback(async (id) => {
    const { error } = await supabase.from('premios').delete().eq('id', id)
    if (error) {
      console.error(error)
      return
    }
    setCache((prev) => ({ usuarioId: prev.usuarioId, valor: prev.valor.filter((p) => p.id !== id) }))
  }, [])

  return { premios, cargando, agregarPremio, editarPremio, eliminarPremio }
}
