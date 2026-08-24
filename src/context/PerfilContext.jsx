import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { crearEstructuraNotas } from '../utils/materiaEstructura'
import { useAuth } from './useAuth.js'
import { PerfilContext } from './perfilContextObject.js'

export function PerfilProvider({ children }) {
  const { usuario, configurado } = useAuth()

  // Se guarda junto con el id del usuario para el que se pidió: si el
  // usuario cambia (logout + login de otra cuenta), el valor cacheado deja
  // de "valer" automáticamente sin tener que resetearlo a mano en un efecto.
  const [perfilCache, setPerfilCache] = useState(null)
  const [carreras, setCarreras] = useState(undefined)
  const [reglasCarreraCache, setReglasCarreraCache] = useState(null)
  const [eligiendo, setEligiendo] = useState(false)
  const [error, setError] = useState('')

  const perfil = usuario && perfilCache?.usuarioId === usuario.id ? perfilCache.valor : undefined
  const cargandoPerfil = configurado && Boolean(usuario) && perfil === undefined
  const carreraId = perfil?.carrera_id ?? null

  const reglasCarrera = carreraId && reglasCarreraCache?.carreraId === carreraId ? reglasCarreraCache.valor : undefined
  const cargandoReglasCarrera = Boolean(carreraId) && reglasCarrera === undefined

  useEffect(() => {
    if (!configurado || !usuario) return
    if (perfilCache?.usuarioId === usuario.id) return

    let cancelado = false

    supabase
      .from('perfiles')
      .select('user_id, carrera_id')
      .eq('user_id', usuario.id)
      .maybeSingle()
      .then(({ data, error: errorConsulta }) => {
        if (cancelado) return
        if (errorConsulta) setError(errorConsulta.message)
        setPerfilCache({ usuarioId: usuario.id, valor: data })
      })

    return () => {
      cancelado = true
    }
  }, [usuario, configurado, perfilCache])

  // Solo hace falta la lista de carreras mientras el usuario todavía no
  // eligió, y solo se busca una vez (no se vuelve a pedir aunque cambien las
  // demás dependencias del efecto).
  useEffect(() => {
    if (!configurado || !usuario || cargandoPerfil || perfil?.carrera_id) return
    if (carreras !== undefined) return

    let cancelado = false

    supabase
      .from('carreras')
      .select('id, nombre')
      .order('nombre')
      .then(({ data, error: errorConsulta }) => {
        if (cancelado) return
        if (errorConsulta) setError(errorConsulta.message)
        setCarreras(data ?? [])
      })

    return () => {
      cancelado = true
    }
  }, [usuario, configurado, cargandoPerfil, perfil, carreras])

  // Trae las reglas de evaluación y puntos de la carrera ya elegida (una vez
  // que el usuario eligió, no antes). Se cachea por carreraId igual que el
  // resto, para no volver a pedirla si ya la tenemos.
  useEffect(() => {
    if (!configurado || !usuario || !carreraId) return
    if (reglasCarreraCache?.carreraId === carreraId) return

    let cancelado = false

    supabase
      .from('carreras')
      .select('nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora')
      .eq('id', carreraId)
      .maybeSingle()
      .then(({ data, error: errorConsulta }) => {
        if (cancelado) return
        if (errorConsulta) setError(errorConsulta.message)
        const valor = data
          ? {
              notaAprobacion: data.nota_aprobacion,
              notaPromocion: data.nota_promocion,
              permitePromocion: data.permite_promocion,
              puntosPorHora: data.puntos_por_hora,
            }
          : null
        setReglasCarreraCache({ carreraId, valor })
      })

    return () => {
      cancelado = true
    }
  }, [usuario, configurado, carreraId, reglasCarreraCache])

  // Clona todas las materias del catálogo de la carrera hacia user_materias.
  // Las notas quedan vacías, overrides y tick manual en null.
  const clonarPlanDeEstudio = async (carreraId) => {
    const { data: catalogo, error: errorCatalogo } = await supabase
      .from('materias_catalogo')
      .select('*')
      .eq('carrera_id', carreraId)

    if (errorCatalogo) throw errorCatalogo
    if (!catalogo || catalogo.length === 0) return

    const filas = catalogo.map((materiaCatalogo) => {
      const { parciales, final } = crearEstructuraNotas({
        cantidadParciales: materiaCatalogo.cantidad_parciales,
        cantidadRecuperatorios: materiaCatalogo.cantidad_recuperatorios,
        cantidadInstanciasFinal: materiaCatalogo.cantidad_instancias_final,
      })

      return {
        user_id: usuario.id,
        materia_catalogo_id: materiaCatalogo.id,
        nombre: materiaCatalogo.nombre,
        anio_cursada: materiaCatalogo.anio_cursada,
        horas_catedra: materiaCatalogo.horas_catedra,
        cantidad_parciales: materiaCatalogo.cantidad_parciales,
        cantidad_recuperatorios: materiaCatalogo.cantidad_recuperatorios,
        cantidad_instancias_final: materiaCatalogo.cantidad_instancias_final,
        parciales,
        final,
      }
    })

    const { error: errorClonado } = await supabase.from('user_materias').insert(filas)
    if (errorClonado) throw errorClonado
  }

  // Clona el catálogo de premios de ejemplo (a nivel app, no por carrera)
  // hacia la tabla `premios` del usuario. Igual que el plan de estudio, es
  // un punto de partida: quedan 100% suyos, sin ninguna atadura al catálogo.
  const clonarPremiosDefault = async () => {
    const { data: catalogo, error: errorCatalogo } = await supabase.from('premios_catalogo').select('*')

    if (errorCatalogo) throw errorCatalogo
    if (!catalogo || catalogo.length === 0) return

    const filas = catalogo.map((premioCatalogo) => ({
      user_id: usuario.id,
      nombre: premioCatalogo.nombre,
      categoria: premioCatalogo.categoria,
      costo_puntos: premioCatalogo.costo_puntos,
    }))

    const { error: errorClonado } = await supabase.from('premios').insert(filas)
    if (errorClonado) throw errorClonado
  }

  const elegirCarrera = async (carreraId) => {
    if (!usuario) return

    setEligiendo(true)
    setError('')

    try {
      const { error: errorPerfil } = await supabase
        .from('perfiles')
        .upsert({ user_id: usuario.id, carrera_id: carreraId }, { onConflict: 'user_id' })
      if (errorPerfil) throw errorPerfil

      // El clonado solo pasa una vez: si el usuario ya tiene materias
      // propias (de una elección anterior), no lo volvemos a disparar.
      const { count, error: errorConteo } = await supabase
        .from('user_materias')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', usuario.id)
      if (errorConteo) throw errorConteo

      if (!count) {
        await clonarPlanDeEstudio(carreraId)
      }

      // Mismo criterio, pero con su propio guard independiente: si el
      // usuario ya tiene premios propios (de una elección anterior), no se
      // vuelve a disparar, aunque el de materias sí se haya disparado.
      const { count: countPremios, error: errorConteoPremios } = await supabase
        .from('premios')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', usuario.id)
      if (errorConteoPremios) throw errorConteoPremios

      if (!countPremios) {
        await clonarPremiosDefault()
      }

      setPerfilCache({ usuarioId: usuario.id, valor: { user_id: usuario.id, carrera_id: carreraId } })
    } catch (errorElegir) {
      setError(errorElegir.message)
    } finally {
      setEligiendo(false)
    }
  }

  const value = {
    perfil: perfil ?? null,
    cargandoPerfil,
    carreraElegida: perfil?.carrera_id != null,
    carreras: carreras ?? [],
    cargandoCarreras: carreras === undefined && !cargandoPerfil && !perfil?.carrera_id,
    reglasCarrera,
    cargandoReglasCarrera,
    elegirCarrera,
    eligiendo,
    error,
  }

  return <PerfilContext.Provider value={value}>{children}</PerfilContext.Provider>
}
