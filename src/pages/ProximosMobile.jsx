import { useState } from 'react'
import { Link } from 'react-router-dom'
import BottomSheet from '../components/BottomSheet.jsx'
import HojaNota from '../components/HojaNota.jsx'
import { usePerfil } from '../context/usePerfil.js'
import { useMaterias } from '../hooks/useMaterias.js'
import { contarInstanciasVisibles, evaluarCursada } from '../utils/cursada'
import { calcularPuntosMateria } from '../utils/puntosMateria'
import { calcularReglasEfectivas } from '../utils/reglasMateria'
import './ProximosMobile.css'

function ordinalCorto(n) {
  if (n === 1) return '1er'
  if (n === 2) return '2do'
  if (n === 3) return '3er'
  return `${n}to`
}

// Mismo criterio de etiquetas que los chips de MateriaDetalleMobile.jsx
// ("Original"/"Recu 1"/"Inst. 1"), pero en la forma más larga que pide esta
// pantalla ("1er Parcial", "Recuperatorio 1er P.", "Examen Final").
function etiquetaInstanciaProxima(tipo, indiceParcial, indiceInstancia) {
  if (tipo === 'final') return 'Examen Final'
  const ordinalParcial = ordinalCorto(indiceParcial + 1)
  if (indiceInstancia === 0) return `${ordinalParcial} Parcial`
  const numero = indiceInstancia > 1 ? ` ${indiceInstancia}°` : ''
  return `Recuperatorio${numero} ${ordinalParcial} P.`
}

// "YYYY-MM-DD" en hora local (no UTC), para comparar contra las fechas que
// ya se guardan en ese mismo formato.
function hoyISO() {
  return new Date().toLocaleDateString('en-CA')
}

function diasHasta(fechaIso, hoyIso) {
  const unDia = 24 * 60 * 60 * 1000
  const fecha = new Date(`${fechaIso}T00:00:00`)
  const hoy = new Date(`${hoyIso}T00:00:00`)
  return Math.round((fecha - hoy) / unDia)
}

function etiquetaCuantoFalta(dias) {
  if (dias <= 0) return 'Hoy'
  if (dias === 1) return 'Mañana'
  return `En ${dias} días`
}

function formatearFecha(fechaIso) {
  const fecha = new Date(`${fechaIso}T00:00:00`)
  return fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Instancias "activas" de una materia (mismo contarInstanciasVisibles - 1
// que ya usan las notificaciones push) que todavía no tienen nota cargada:
// son las únicas candidatas a aparecer en Próximos, en "Notas pendientes" o
// en el paso 2 de "Agendar nueva fecha". Una vez que una instancia tiene
// nota, evaluarParcial/evaluarFinal ya avanzaron de página — no hay nada
// más que agendar ni cargar ahí.
function instanciasActivasSinNota(materia, reglas, evaluacion) {
  const instancias = []

  materia.parciales.forEach((parcial, indiceParcial) => {
    const activo = contarInstanciasVisibles(parcial.notas, reglas, { esParcial: true }) - 1
    if (parcial.notas[activo] != null) return
    instancias.push({ tipo: 'parcial', indiceParcial, indiceInstancia: activo, fecha: parcial.fechas?.[activo] ?? null })
  })

  if (evaluacion.resultadoFinal !== null) {
    const activo = contarInstanciasVisibles(materia.final.notas, reglas) - 1
    if (materia.final.notas[activo] == null) {
      instancias.push({ tipo: 'final', indiceInstancia: activo, fecha: materia.final.fechas?.[activo] ?? null })
    }
  }

  return instancias
}

// Mismo mecanismo que actualizarNotaParcial/actualizarNotaFinal de
// MateriaDetalleMobile.jsx (prompt-29, sección 1: fecha por instancia),
// reimplementado acá porque esta pantalla recorre TODAS las materias en vez
// de operar sobre una sola ya fija en el componente.
function actualizarNotaParcial(editarMateria, materia, indiceParcial, indiceInstancia, valor, fecha) {
  const nota = valor === '' || valor == null ? null : Number(valor)
  const parciales = materia.parciales.map((p, i) => {
    if (i !== indiceParcial) return p
    const fechasBase = Array.from({ length: p.notas.length }, (_, j) => p.fechas?.[j] ?? null)
    return {
      notas: p.notas.map((n, j) => (j === indiceInstancia ? nota : n)),
      fechas: fechasBase.map((f, j) => (j === indiceInstancia ? fecha || null : f)),
    }
  })
  editarMateria(materia.id, { parciales })
}

function actualizarNotaFinal(editarMateria, materia, indiceInstancia, valor, fecha) {
  const nota = valor === '' || valor == null ? null : Number(valor)
  const notas = materia.final.notas.map((n, j) => (j === indiceInstancia ? nota : n))
  const fechasBase = Array.from({ length: materia.final.notas.length }, (_, j) => materia.final.fechas?.[j] ?? null)
  const fechas = fechasBase.map((f, j) => (j === indiceInstancia ? fecha || null : f))
  editarMateria(materia.id, { final: { notas, fechas } })
}

// Paso 1 de "Agendar nueva fecha": buscador + lista de materias, inspirado
// en el patrón de acordeón de HojaNuevoPremio.jsx.
function PasoElegirMateria({ materias, busqueda, onCambiarBusqueda, onElegir }) {
  const filtradas = materias.filter(({ materia }) => materia.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()))

  return (
    <div className="proximos-agendar-paso">
      <input
        type="text"
        className="hoja-premio-input"
        placeholder="Buscar materia"
        value={busqueda}
        onChange={(e) => onCambiarBusqueda(e.target.value)}
        autoFocus
      />
      <div className="proximos-agendar-lista">
        {filtradas.length === 0 ? (
          <p className="proximos-agendar-vacio">Ninguna materia coincide con la búsqueda.</p>
        ) : (
          filtradas.map(({ materia }) => (
            <button key={materia.id} type="button" className="proximos-agendar-opcion" onClick={() => onElegir(materia.id)}>
              {materia.nombre}
            </button>
          ))
        )}
      </div>
    </div>
  )
}

// Paso 2: solo las instancias activas sin nota de esa materia (parciales +
// final si corresponde) — es la única a la que tiene sentido ponerle fecha.
function PasoElegirInstancia({ materiaNombre, instancias, onElegir, onVolver }) {
  return (
    <div className="proximos-agendar-paso">
      <button type="button" className="proximos-agendar-volver" onClick={onVolver}>
        ‹ {materiaNombre}
      </button>
      {instancias.length === 0 ? (
        <p className="proximos-agendar-vacio">Esta materia no tiene ninguna instancia pendiente para ponerle fecha.</p>
      ) : (
        <div className="proximos-agendar-lista">
          {instancias.map((instancia) => {
            const etiqueta = etiquetaInstanciaProxima(instancia.tipo, instancia.indiceParcial, instancia.indiceInstancia)
            return (
              <button
                key={`${instancia.tipo}-${instancia.indiceParcial ?? 'f'}-${instancia.indiceInstancia}`}
                type="button"
                className="proximos-agendar-opcion"
                onClick={() => onElegir(instancia)}
              >
                <span>{etiqueta}</span>
                <span className="proximos-agendar-opcion-nota">{instancia.fecha ? formatearFecha(instancia.fecha) : 'Sin fecha'}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Paso 3: la fecha en sí, mismo input que HojaNota.jsx.
function PasoElegirFecha({ etiqueta, fecha, onCambiarFecha, onVolver, onConfirmar }) {
  return (
    <div className="proximos-agendar-paso">
      <button type="button" className="proximos-agendar-volver" onClick={onVolver}>
        ‹ {etiqueta}
      </button>
      <label className="proximos-agendar-fecha-campo">
        <span className="hoja-premio-label">Fecha</span>
        <input type="date" className="hoja-premio-input" value={fecha} onChange={(e) => onCambiarFecha(e.target.value)} />
      </label>
      <button type="button" className="boton-primario-mobile" disabled={!fecha} onClick={onConfirmar}>
        Confirmar fecha
      </button>
    </div>
  )
}

// Pantalla nueva (sección "1" del prompt de Próximos/progreso-carrera/tema):
// junta las fechas de parciales y finales de todas las materias en un solo
// lugar, para no tener que entrar materia por materia a revisar. La
// instancia "activa" de cada parcial/final es siempre la misma que ya usan
// las notificaciones push (contarInstanciasVisibles - 1).
function ProximosMobile() {
  const { materias, cargando, editarMateria } = useMaterias()
  const { reglasCarrera } = usePerfil()

  const [notaPendienteSheet, setNotaPendienteSheet] = useState(null)
  const [agendar, setAgendar] = useState(null)
  const [busquedaMateria, setBusquedaMateria] = useState('')

  if (cargando) {
    return (
      <section className="page-mobile">
        <h1>Próximos</h1>
        <p className="page-placeholder">Cargando…</p>
      </section>
    )
  }

  const hoy = hoyISO()

  const materiasEnriquecidas = materias.map((materia) => {
    const reglas = calcularReglasEfectivas(materia, reglasCarrera)
    const evaluacion = evaluarCursada(materia, reglas)
    return { materia, reglas, evaluacion, puntos: calcularPuntosMateria(materia, reglas) }
  })

  const proximos = []
  const pendientes = []
  let parcialesSinFecha = 0
  let finalesSinFecha = 0

  for (const { materia, reglas, evaluacion, puntos } of materiasEnriquecidas) {
    for (const instancia of instanciasActivasSinNota(materia, reglas, evaluacion)) {
      if (!instancia.fecha) {
        if (instancia.tipo === 'parcial') parcialesSinFecha += 1
        else finalesSinFecha += 1
        continue
      }
      const etiqueta = etiquetaInstanciaProxima(instancia.tipo, instancia.indiceParcial, instancia.indiceInstancia)
      const item = { materia, reglas, puntos, etiqueta, ...instancia }
      if (instancia.fecha >= hoy) proximos.push(item)
      else pendientes.push(item)
    }
  }

  proximos.sort((a, b) => a.fecha.localeCompare(b.fecha))
  pendientes.sort((a, b) => a.fecha.localeCompare(b.fecha))

  const sinFechas = proximos.length === 0 && pendientes.length === 0

  const abrirAgendar = () => {
    setBusquedaMateria('')
    setAgendar({ paso: 1 })
  }
  const cerrarAgendar = () => setAgendar(null)
  const elegirMateriaAgendar = (materiaId) => setAgendar({ paso: 2, materiaId })
  const volverPaso1Agendar = () => setAgendar({ paso: 1 })
  const elegirInstanciaAgendar = (instancia) =>
    setAgendar((prev) => ({
      ...prev,
      paso: 3,
      tipo: instancia.tipo,
      indiceParcial: instancia.indiceParcial,
      indiceInstancia: instancia.indiceInstancia,
      fecha: instancia.fecha ?? '',
    }))
  const volverPaso2Agendar = () => setAgendar((prev) => ({ paso: 2, materiaId: prev.materiaId }))
  const cambiarFechaAgendar = (valor) => setAgendar((prev) => ({ ...prev, fecha: valor }))

  const confirmarAgendar = () => {
    const { materiaId, tipo, indiceParcial, indiceInstancia, fecha } = agendar
    const materia = materias.find((m) => m.id === materiaId)
    if (!materia || !fecha) return
    if (tipo === 'parcial') actualizarNotaParcial(editarMateria, materia, indiceParcial, indiceInstancia, null, fecha)
    else actualizarNotaFinal(editarMateria, materia, indiceInstancia, null, fecha)
    setAgendar(null)
  }

  const materiaAgendarSeleccionada = agendar?.materiaId ? materiasEnriquecidas.find((m) => m.materia.id === agendar.materiaId) : null
  const instanciasAgendarDisponibles = materiaAgendarSeleccionada
    ? instanciasActivasSinNota(materiaAgendarSeleccionada.materia, materiaAgendarSeleccionada.reglas, materiaAgendarSeleccionada.evaluacion)
    : []

  const cerrarCargarNota = () => setNotaPendienteSheet(null)
  const cambiarFechaPendiente = (valor) => {
    const { materia, tipo, indiceParcial, indiceInstancia } = notaPendienteSheet
    if (tipo === 'parcial') actualizarNotaParcial(editarMateria, materia, indiceParcial, indiceInstancia, null, valor)
    else actualizarNotaFinal(editarMateria, materia, indiceInstancia, null, valor)
    setNotaPendienteSheet((prev) => ({ ...prev, fecha: valor }))
  }
  const elegirNotaPendiente = (valor) => {
    const { materia, tipo, indiceParcial, indiceInstancia, fecha } = notaPendienteSheet
    if (tipo === 'parcial') actualizarNotaParcial(editarMateria, materia, indiceParcial, indiceInstancia, valor, fecha)
    else actualizarNotaFinal(editarMateria, materia, indiceInstancia, valor, fecha)
    setNotaPendienteSheet(null)
  }

  return (
    <section className="page-mobile proximos-mobile">
      <h1>Próximos</h1>

      {sinFechas ? (
        <div className="proximos-mobile-vacio">
          <span className="material-symbols-outlined proximos-mobile-vacio-icono" aria-hidden="true">
            event_available
          </span>
          <p className="proximos-mobile-vacio-texto">
            Todavía no cargaste ninguna fecha de parcial o final. Se cargan desde el detalle de cada materia, o con el botón de acá abajo.
          </p>
          <Link to="/" className="boton-primario-mobile">
            Ir a Mis Materias
          </Link>
          <div className="proximos-mobile-vacio-contadores">
            <div className="proximos-mobile-vacio-contador">
              <span className="proximos-mobile-vacio-contador-valor">{parcialesSinFecha}</span>
              <span className="proximos-mobile-vacio-contador-label">Parciales</span>
            </div>
            <div className="proximos-mobile-vacio-contador">
              <span className="proximos-mobile-vacio-contador-valor">{finalesSinFecha}</span>
              <span className="proximos-mobile-vacio-contador-label">Finales</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          {proximos.length > 0 && (
            <section className="mobile-seccion">
              <h4 className="seccion-mobile-label">Fechas próximas</h4>
              <div className="proximos-mobile-lista">
                {proximos.map((item, indice) => {
                  const dias = diasHasta(item.fecha, hoy)
                  return (
                    <Link
                      key={`${item.materia.id}-${item.tipo}-${item.indiceParcial ?? 'f'}-${item.indiceInstancia}`}
                      to={`/materias/${item.materia.id}`}
                      className={indice === 0 ? 'proximos-mobile-item destacado' : 'proximos-mobile-item'}
                    >
                      <div className="proximos-mobile-item-info">
                        <span className="proximos-mobile-item-materia">{item.materia.nombre}</span>
                        <span className="proximos-mobile-item-etiqueta">{item.etiqueta}</span>
                        <span className="proximos-mobile-item-fecha">{formatearFecha(item.fecha)}</span>
                      </div>
                      <span className={indice === 0 ? 'proximos-mobile-chip destacado' : 'proximos-mobile-chip'}>
                        {etiquetaCuantoFalta(dias)}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {pendientes.length > 0 && (
            <section className="mobile-seccion">
              <h4 className="seccion-mobile-label">Notas pendientes de cargar</h4>
              <div className="proximos-mobile-lista">
                {pendientes.map((item) => (
                  <div
                    key={`${item.materia.id}-${item.tipo}-${item.indiceParcial ?? 'f'}-${item.indiceInstancia}`}
                    className="proximos-mobile-pendiente-item"
                  >
                    <div className="proximos-mobile-item-info">
                      <span className="proximos-mobile-item-materia">{item.materia.nombre}</span>
                      <span className="proximos-mobile-item-etiqueta">{item.etiqueta}</span>
                      <span className="proximos-mobile-item-fecha">
                        {formatearFecha(item.fecha)}
                        {item.puntos > 0 && ` · vale ${item.puntos} pts`}
                      </span>
                    </div>
                    <button type="button" className="proximos-mobile-cargar-boton" onClick={() => setNotaPendienteSheet(item)}>
                      Cargar nota
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <button type="button" className="boton-primario-mobile proximos-mobile-agendar-boton" onClick={abrirAgendar}>
        <span className="material-symbols-outlined" aria-hidden="true">
          event
        </span>
        Agendar nueva fecha
      </button>

      <BottomSheet
        abierto={notaPendienteSheet != null}
        onCerrar={cerrarCargarNota}
        titulo={notaPendienteSheet ? `${notaPendienteSheet.materia.nombre} · ${notaPendienteSheet.etiqueta}` : ''}
      >
        {notaPendienteSheet && (
          <HojaNota
            ayuda={`Se aprueba con ${notaPendienteSheet.reglas.notaAprobacion} o más.`}
            notaAprobacion={notaPendienteSheet.reglas.notaAprobacion}
            fecha={notaPendienteSheet.fecha}
            onCambiarFecha={cambiarFechaPendiente}
            onElegir={elegirNotaPendiente}
            onBorrar={cerrarCargarNota}
          />
        )}
      </BottomSheet>

      <BottomSheet abierto={agendar != null} onCerrar={cerrarAgendar} titulo="Agendar nueva fecha">
        {agendar?.paso === 1 && (
          <PasoElegirMateria
            materias={materiasEnriquecidas}
            busqueda={busquedaMateria}
            onCambiarBusqueda={setBusquedaMateria}
            onElegir={elegirMateriaAgendar}
          />
        )}
        {agendar?.paso === 2 && materiaAgendarSeleccionada && (
          <PasoElegirInstancia
            materiaNombre={materiaAgendarSeleccionada.materia.nombre}
            instancias={instanciasAgendarDisponibles}
            onElegir={elegirInstanciaAgendar}
            onVolver={volverPaso1Agendar}
          />
        )}
        {agendar?.paso === 3 && (
          <PasoElegirFecha
            etiqueta={etiquetaInstanciaProxima(agendar.tipo, agendar.indiceParcial, agendar.indiceInstancia)}
            fecha={agendar.fecha}
            onCambiarFecha={cambiarFechaAgendar}
            onVolver={volverPaso2Agendar}
            onConfirmar={confirmarAgendar}
          />
        )}
      </BottomSheet>
    </section>
  )
}

export default ProximosMobile
