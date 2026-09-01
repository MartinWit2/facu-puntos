// Edge Function que corre una vez por día (disparada por pg_cron + pg_net,
// ver el comentario al final de este archivo) y manda los recordatorios
// push de parcial/final próximo y de nota pendiente de cargar (secciones
// "4.3"-"4.5" del prompt de notificaciones).
//
// Reusa la lógica real de evaluación de materias (evaluarCursada,
// contarInstanciasVisibles, calcularReglasEfectivas) importándola tal cual
// del frontend en vez de reimplementarla acá: son módulos puros (sin
// imports ni APIs de browser), así que Deno los puede importar por path
// relativo sin ningún adaptador. Esto es a propósito — así el criterio de
// "qué instancia es la activa" nunca puede divergir entre la app y el
// proceso de notificaciones.
import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3'
import { calcularReglasEfectivas } from '../../../src/utils/reglasMateria.js'
import { contarInstanciasVisibles, evaluarCursada } from '../../../src/utils/cursada.js'

// Mismas constantes que src/constants.js (no se puede importar ese archivo
// tal cual porque tira de otros módulos con imports de Vite/React) — si se
// cambian acá, cambiarlas también ahí.
const RECORDATORIO_PROXIMO_DIAS_ANTES = 3
const RECORDATORIO_NOTA_PENDIENTE_DIAS = 7

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT')!

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

function filaAMateria(fila: Record<string, unknown>) {
  return {
    id: fila.id as string,
    userId: fila.user_id as string,
    nombre: fila.nombre as string,
    cantidadParciales: fila.cantidad_parciales as number,
    cantidadRecuperatorios: fila.cantidad_recuperatorios as number,
    cantidadInstanciasFinal: fila.cantidad_instancias_final as number,
    parciales: fila.parciales as { notas: (number | null)[]; fechas?: (string | null)[] }[],
    final: fila.final as { notas: (number | null)[]; fechas?: (string | null)[] },
    tickManual: fila.tick_manual as string | null,
    poolOverride: fila.pool_override as number | null,
    notaAprobacionOverride: fila.nota_aprobacion_override as number | null,
    notaPromocionOverride: fila.nota_promocion_override as number | null,
    permitePromocionOverride: fila.permite_promocion_override as boolean | null,
    promocionPorPromedioOverride: fila.promocion_por_promedio_override as boolean | null,
    empezada: fila.empezada as boolean,
  }
}

// Mismo criterio de fallback que PerfilContext.jsx: si el perfil tiene
// carrera_id, las reglas son las de esa carrera; si no, las reglas propias
// (columnas *_custom del perfil).
function construirMapaReglasPorUsuario(
  perfiles: Record<string, unknown>[],
  carrerasPorId: Map<string, Record<string, unknown>>,
) {
  const mapa = new Map<string, ReturnType<typeof calcularReglasEfectivas> | null>()
  for (const perfil of perfiles) {
    const userId = perfil.user_id as string
    const carreraId = perfil.carrera_id as string | null
    if (carreraId) {
      const carrera = carrerasPorId.get(carreraId)
      if (carrera) {
        mapa.set(userId, {
          notaAprobacion: carrera.nota_aprobacion as number,
          notaPromocion: carrera.nota_promocion as number,
          permitePromocion: carrera.permite_promocion as boolean,
          promocionPorPromedio: carrera.promocion_por_promedio as boolean,
          puntosPorHora: carrera.puntos_por_hora as number,
        })
      }
    } else if (perfil.nota_aprobacion_custom != null) {
      mapa.set(userId, {
        notaAprobacion: perfil.nota_aprobacion_custom as number,
        notaPromocion: perfil.nota_promocion_custom as number,
        permitePromocion: perfil.permite_promocion_custom as boolean,
        promocionPorPromedio: perfil.promocion_por_promedio_custom as boolean,
        puntosPorHora: perfil.puntos_por_hora_custom as number,
      })
    }
  }
  return mapa
}

function hoyISO() {
  return new Date().toISOString().slice(0, 10)
}

function diasEntre(desdeISO: string, hastaISO: string) {
  const desde = new Date(`${desdeISO}T00:00:00Z`)
  const hasta = new Date(`${hastaISO}T00:00:00Z`)
  return Math.round((hasta.getTime() - desde.getTime()) / 86_400_000)
}

function sumarDias(fechaISOStr: string, dias: number) {
  const fecha = new Date(`${fechaISOStr}T00:00:00Z`)
  fecha.setUTCDate(fecha.getUTCDate() + dias)
  return fecha.toISOString().slice(0, 10)
}

type Aviso = {
  userId: string
  materiaId: string
  materiaNombre: string
  tipo: 'parcial_proximo' | 'final_proximo' | 'nota_pendiente'
  claveInstancia: string
  fecha: string
  textoEspecifico: string
}

// Evalúa las tres condiciones de la sección "4.3" para una única instancia
// (un parcial puntual, o el final) que ya se identificó como "la activa".
function evaluarInstancia(
  hoy: string,
  materiaId: string,
  materiaNombre: string,
  tipoProximo: 'parcial_proximo' | 'final_proximo',
  claveInstancia: string,
  fecha: string | null | undefined,
  etiquetaInstancia: string,
  registrosExistentes: Map<string, Record<string, unknown>>,
): Aviso | null {
  if (!fecha) return null

  // El mapa se arma con `${materiaId}:${claveInstancia}` — hay que buscar
  // con la misma clave compuesta, porque `claveInstancia` sola (ej.
  // "parcial-0-instancia-1") se repite igual entre materias distintas.
  const claveCompuesta = `${materiaId}:${claveInstancia}`
  const dias = diasEntre(hoy, fecha)
  const registro = registrosExistentes.get(claveCompuesta)

  if (dias >= 0) {
    // (a)/(b): próximo, dentro de la ventana, y todavía no se avisó para
    // esta MISMA fecha (si la fecha cambió, es un aviso nuevo).
    if (dias > RECORDATORIO_PROXIMO_DIAS_ANTES) return null
    if (registro?.tipo === tipoProximo && registro.ultima_fecha_referencia === fecha) return null
    return {
      userId: '',
      materiaId,
      materiaNombre,
      tipo: tipoProximo,
      claveInstancia,
      fecha,
      textoEspecifico:
        tipoProximo === 'parcial_proximo'
          ? `${materiaNombre}: ${etiquetaInstancia} el ${fecha}.`
          : `${materiaNombre}: final el ${fecha}.`,
    }
  }

  // (c): la fecha ya pasó y sigue sin nota — se repite cada
  // RECORDATORIO_NOTA_PENDIENTE_DIAS días desde el primer aviso posible.
  const registroPendiente = registrosExistentes.get(`nota_pendiente:${claveCompuesta}`)
  if (!registroPendiente || registroPendiente.ultima_fecha_referencia !== fecha) {
    // Todavía no hay registro para ESTA fecha (o la fecha cambió): el
    // primer aviso posible es recién a los N días de pasada la fecha.
    if (hoy < sumarDias(fecha, RECORDATORIO_NOTA_PENDIENTE_DIAS)) return null
    return {
      userId: '',
      materiaId,
      materiaNombre,
      tipo: 'nota_pendiente',
      claveInstancia,
      fecha,
      textoEspecifico: `${materiaNombre}: ${etiquetaInstancia} sin cargar (era el ${fecha}).`,
    }
  }

  if (hoy >= (registroPendiente.proximo_envio_en as string)) {
    return {
      userId: '',
      materiaId,
      materiaNombre,
      tipo: 'nota_pendiente',
      claveInstancia,
      fecha,
      textoEspecifico: `${materiaNombre}: ${etiquetaInstancia} sin cargar (era el ${fecha}).`,
    }
  }

  return null
}

Deno.serve(async () => {
  const hoy = hoyISO()

  const [{ data: perfiles }, { data: carreras }, { data: materiasRaw }, { data: registrosRaw }] = await Promise.all([
    supabase
      .from('perfiles')
      .select(
        'user_id, carrera_id, nota_aprobacion_custom, nota_promocion_custom, permite_promocion_custom, promocion_por_promedio_custom, puntos_por_hora_custom',
      ),
    supabase.from('carreras').select('id, nota_aprobacion, nota_promocion, permite_promocion, promocion_por_promedio, puntos_por_hora'),
    supabase
      .from('user_materias')
      .select(
        'id, user_id, nombre, cantidad_parciales, cantidad_recuperatorios, cantidad_instancias_final, parciales, final, tick_manual, pool_override, nota_aprobacion_override, nota_promocion_override, permite_promocion_override, promocion_por_promedio_override, empezada',
      ),
    supabase.from('notificaciones_enviadas').select('*'),
  ])

  const carrerasPorId = new Map((carreras ?? []).map((c) => [c.id as string, c]))
  const reglasPorUsuario = construirMapaReglasPorUsuario(perfiles ?? [], carrerasPorId)

  // Clave compuesta (materiaId + tipo + claveInstancia) → registro. Los de
  // tipo nota_pendiente se guardan aparte con prefijo, porque un
  // parcial/final puede pasar por "próximo" y después por "pendiente" con
  // la MISMA claveInstancia, y son conceptualmente registros distintos.
  const registrosPorClave = new Map<string, Record<string, unknown>>()
  for (const registro of registrosRaw ?? []) {
    const clave = `${registro.materia_id}:${registro.clave_instancia}`
    if (registro.tipo === 'nota_pendiente') registrosPorClave.set(`nota_pendiente:${clave}`, registro)
    else registrosPorClave.set(clave, registro)
  }

  const avisos: Aviso[] = []

  for (const filaMateria of materiasRaw ?? []) {
    const materia = filaAMateria(filaMateria)
    const reglasCarrera = reglasPorUsuario.get(materia.userId)
    if (!reglasCarrera) continue // perfil sin carrera ni reglas propias todavía

    const reglas = calcularReglasEfectivas(materia, reglasCarrera)
    const evaluacion = evaluarCursada(materia, reglas)

    materia.parciales.forEach((parcial, indiceParcial) => {
      const activo = contarInstanciasVisibles(parcial.notas, reglas) - 1
      if (parcial.notas[activo] != null) return // esa instancia ya tiene nota (aprobó o fue la última agotada)

      const etiqueta = activo === 0 ? 'el parcial' : `el recuperatorio ${activo} del parcial ${indiceParcial + 1}`
      const clave = `parcial-${indiceParcial}-instancia-${activo}`
      const aviso = evaluarInstancia(
        hoy,
        materia.id,
        materia.nombre,
        'parcial_proximo',
        clave,
        parcial.fechas?.[activo],
        etiqueta,
        registrosPorClave,
      )
      if (aviso) avisos.push({ ...aviso, userId: materia.userId })
    })

    if (evaluacion.resultadoFinal !== null) {
      const activo = contarInstanciasVisibles(materia.final.notas, reglas) - 1
      if (materia.final.notas[activo] == null) {
        const clave = `final-instancia-${activo}`
        const aviso = evaluarInstancia(
          hoy,
          materia.id,
          materia.nombre,
          'final_proximo',
          clave,
          materia.final.fechas?.[activo],
          'el final',
          registrosPorClave,
        )
        if (aviso) avisos.push({ ...aviso, userId: materia.userId })
      }
    }
  }

  // Agrupa por usuario: 1 aviso → notificación específica a esa materia; 2+
  // → un solo resumen a /materias, para no saturar el mismo día.
  const avisosPorUsuario = new Map<string, Aviso[]>()
  for (const aviso of avisos) {
    const lista = avisosPorUsuario.get(aviso.userId) ?? []
    lista.push(aviso)
    avisosPorUsuario.set(aviso.userId, lista)
  }

  const { data: suscripciones } = await supabase.from('push_subscriptions').select('*')
  const suscripcionesPorUsuario = new Map<string, Record<string, unknown>[]>()
  for (const suscripcion of suscripciones ?? []) {
    const lista = suscripcionesPorUsuario.get(suscripcion.user_id as string) ?? []
    lista.push(suscripcion)
    suscripcionesPorUsuario.set(suscripcion.user_id as string, lista)
  }

  let enviados = 0
  const escrituras: Promise<unknown>[] = []

  for (const [userId, listaAvisos] of avisosPorUsuario) {
    const misSuscripciones = suscripcionesPorUsuario.get(userId) ?? []
    if (misSuscripciones.length === 0) continue

    const payload =
      listaAvisos.length === 1
        ? { title: 'Unipoints', body: listaAvisos[0].textoEspecifico, url: `/materias/${listaAvisos[0].materiaId}` }
        : {
            title: 'Unipoints',
            body: `Tenés ${listaAvisos.length} avisos. Tocá para ver el detalle.`,
            url: '/materias',
          }

    for (const suscripcion of misSuscripciones) {
      try {
        await webpush.sendNotification(
          {
            endpoint: suscripcion.endpoint as string,
            keys: { p256dh: suscripcion.p256dh as string, auth: suscripcion.auth_key as string },
          },
          JSON.stringify(payload),
        )
        enviados++
      } catch (error) {
        const status = (error as { statusCode?: number }).statusCode
        if (status === 404 || status === 410) {
          escrituras.push(supabase.from('push_subscriptions').delete().eq('endpoint', suscripcion.endpoint as string))
        } else {
          console.error('Error mandando push', error)
        }
      }
    }

    for (const aviso of listaAvisos) {
      if (aviso.tipo === 'nota_pendiente') {
        const clave = `${aviso.materiaId}:${aviso.claveInstancia}`
        const registroPrevio = registrosPorClave.get(`nota_pendiente:${clave}`)
        const yaExistiaParaEstaFecha = registroPrevio?.ultima_fecha_referencia === aviso.fecha
        const proximoEnvio = sumarDias(
          yaExistiaParaEstaFecha ? (registroPrevio!.proximo_envio_en as string) : sumarDias(aviso.fecha, RECORDATORIO_NOTA_PENDIENTE_DIAS),
          RECORDATORIO_NOTA_PENDIENTE_DIAS,
        )
        escrituras.push(
          supabase.from('notificaciones_enviadas').upsert(
            {
              user_id: aviso.userId,
              materia_id: aviso.materiaId,
              tipo: aviso.tipo,
              clave_instancia: aviso.claveInstancia,
              ultima_fecha_referencia: aviso.fecha,
              proximo_envio_en: proximoEnvio,
              enviado_en: new Date().toISOString(),
            },
            { onConflict: 'user_id,materia_id,tipo,clave_instancia' },
          ),
        )
      } else {
        escrituras.push(
          supabase.from('notificaciones_enviadas').upsert(
            {
              user_id: aviso.userId,
              materia_id: aviso.materiaId,
              tipo: aviso.tipo,
              clave_instancia: aviso.claveInstancia,
              ultima_fecha_referencia: aviso.fecha,
              proximo_envio_en: null,
              enviado_en: new Date().toISOString(),
            },
            { onConflict: 'user_id,materia_id,tipo,clave_instancia' },
          ),
        )
      }
    }
  }

  await Promise.all(escrituras)

  return new Response(JSON.stringify({ ok: true, avisos: avisos.length, enviados }), {
    headers: { 'Content-Type': 'application/json' },
  })
})

// ============================================================
// Disparo diario (sección "4.5"): esto NO se versiona acá — el schedule de
// pg_cron se configura a mano, UNA vez, desde el SQL Editor del dashboard
// de Supabase (así la URL de la función y el token no terminan en el repo).
// Correr algo así (ajustando la URL del proyecto y el token del header
// Authorization por el `service_role` key real, sacado de Project Settings
// → API):
//
//   select cron.schedule(
//     'enviar-recordatorios-diario',
//     '0 12 * * *', -- 12:00 UTC = 9:00 Argentina (UTC-3)
//     $$
//     select net.http_post(
//       url := 'https://<tu-proyecto>.supabase.co/functions/v1/enviar-recordatorios',
//       headers := jsonb_build_object('Authorization', 'Bearer <service_role_key>')
//     );
//     $$
//   );
//
// Para revisar o borrar el schedule más adelante:
//   select * from cron.job;
//   select cron.unschedule('enviar-recordatorios-diario');
