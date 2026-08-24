import { useCallback, useState, useEffect } from 'react'
import { useAuth } from '../context/useAuth.js'
import { supabase } from '../lib/supabaseClient'
import { ajustarEstructuraNotas, crearEstructuraNotas } from '../utils/materiaEstructura'

// user_materias (snake_case) <-> materia (camelCase) que usa el resto de la app.
function filaAMateria(fila) {
  return {
    id: fila.id,
    materiaCatalogoId: fila.materia_catalogo_id,
    nombre: fila.nombre,
    anioCursada: fila.anio_cursada,
    horasCatedra: fila.horas_catedra,
    cantidadParciales: fila.cantidad_parciales,
    cantidadRecuperatorios: fila.cantidad_recuperatorios,
    cantidadInstanciasFinal: fila.cantidad_instancias_final,
    parciales: fila.parciales,
    final: fila.final,
    tickManual: fila.tick_manual,
    notaMateriaManual: fila.nota_materia_manual,
    poolOverride: fila.pool_override,
    notaAprobacionOverride: fila.nota_aprobacion_override,
    notaPromocionOverride: fila.nota_promocion_override,
    permitePromocionOverride: fila.permite_promocion_override,
  }
}

const CAMPO_A_COLUMNA = {
  nombre: 'nombre',
  anioCursada: 'anio_cursada',
  horasCatedra: 'horas_catedra',
  cantidadParciales: 'cantidad_parciales',
  cantidadRecuperatorios: 'cantidad_recuperatorios',
  cantidadInstanciasFinal: 'cantidad_instancias_final',
  parciales: 'parciales',
  final: 'final',
  tickManual: 'tick_manual',
  notaMateriaManual: 'nota_materia_manual',
  poolOverride: 'pool_override',
  notaAprobacionOverride: 'nota_aprobacion_override',
  notaPromocionOverride: 'nota_promocion_override',
  permitePromocionOverride: 'permite_promocion_override',
}

// Solo convierte los campos presentes en `datos` (para poder hacer updates
// parciales, ej. { parciales: [...] } o { tickManual: 'promocion' }).
function materiaAFila(datos) {
  const fila = {}
  for (const [campo, columna] of Object.entries(CAMPO_A_COLUMNA)) {
    if (datos[campo] !== undefined) fila[columna] = datos[campo]
  }
  return fila
}

export function useMaterias() {
  const { usuario } = useAuth()
  // Se cachea junto con el id del usuario, igual que en PerfilContext: si el
  // usuario cambia, el cache deja de "valer" solo, sin resetearlo a mano.
  const [cache, setCache] = useState(null)

  const materias = usuario && cache?.usuarioId === usuario.id ? cache.valor : []
  const cargando = Boolean(usuario) && cache?.usuarioId !== usuario?.id

  useEffect(() => {
    if (!usuario) return
    if (cache?.usuarioId === usuario.id) return

    let cancelado = false

    supabase
      .from('user_materias')
      .select('*')
      .eq('user_id', usuario.id)
      .then(({ data, error }) => {
        if (cancelado) return
        if (error) console.error(error)
        setCache({ usuarioId: usuario.id, valor: (data ?? []).map(filaAMateria) })
      })

    return () => {
      cancelado = true
    }
  }, [usuario, cache])

  const agregarMateria = useCallback(
    async (datos) => {
      if (!usuario) return

      const estructura = crearEstructuraNotas(datos)
      const fila = { user_id: usuario.id, ...materiaAFila({ ...datos, ...estructura }) }

      const { data, error } = await supabase.from('user_materias').insert(fila).select().single()
      if (error) {
        console.error(error)
        return
      }
      setCache((prev) => ({ usuarioId: usuario.id, valor: [...(prev?.valor ?? []), filaAMateria(data)] }))
    },
    [usuario],
  )

  const editarMateria = useCallback(
    async (id, datos) => {
      const materiaActual = cache?.valor.find((m) => m.id === id)
      const cambiaEstructura =
        datos.cantidadParciales !== undefined ||
        datos.cantidadRecuperatorios !== undefined ||
        datos.cantidadInstanciasFinal !== undefined

      const datosCompletos =
        cambiaEstructura && materiaActual ? { ...datos, ...ajustarEstructuraNotas(materiaActual, datos) } : datos

      const { data, error } = await supabase
        .from('user_materias')
        .update(materiaAFila(datosCompletos))
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error(error)
        return
      }
      setCache((prev) => ({
        usuarioId: prev.usuarioId,
        valor: prev.valor.map((m) => (m.id === id ? filaAMateria(data) : m)),
      }))
    },
    [cache],
  )

  const eliminarMateria = useCallback(async (id) => {
    const { error } = await supabase.from('user_materias').delete().eq('id', id)
    if (error) {
      console.error(error)
      return
    }
    setCache((prev) => ({ usuarioId: prev.usuarioId, valor: prev.valor.filter((m) => m.id !== id) }))
  }, [])

  return { materias, cargando, agregarMateria, editarMateria, eliminarMateria }
}
