import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import BottomSheet from '../components/BottomSheet.jsx'
import { useCelebracion } from '../components/Celebracion.jsx'
import HojaEditarMateria from '../components/HojaEditarMateria.jsx'
import HojaNota from '../components/HojaNota.jsx'
import MateriaBadge from '../components/MateriaBadge.jsx'
import { usePerfil } from '../context/usePerfil.js'
import { useMaterias } from '../hooks/useMaterias.js'
import { contarInstanciasVisibles, evaluarCursada } from '../utils/cursada'
import { calcularPoolPuntos } from '../utils/puntos'
import { calcularPuntosMateria } from '../utils/puntosMateria'
import { calcularProgresoMateria } from '../utils/progresoMateria'
import { calcularReglasEfectivas } from '../utils/reglasMateria'
import './MateriaDetalleMobile.css'

const ESTADOS_FESTEJABLES = new Set(['promocion', 'firma'])
const NOTAS_FINAL_MATERIA = [4, 5, 6, 7, 8, 9, 10]

function etiquetaInstanciaParcial(indice) {
  return indice === 0 ? 'Original' : `Recu ${indice}`
}

function etiquetaInstanciaFinal(indice) {
  return `Inst. ${indice + 1}`
}

function formatearFecha(fechaIso) {
  if (!fechaIso) return null
  const fecha = new Date(`${fechaIso}T00:00:00`)
  if (Number.isNaN(fecha.getTime())) return null
  return fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Versión compacta (dd/mm, sin año) para mostrar al lado de la etiqueta de
// cada chip de instancia — "Recu 1 · 14/10".
function formatearFechaCorta(fechaIso) {
  if (!fechaIso) return null
  const fecha = new Date(`${fechaIso}T00:00:00`)
  if (Number.isNaN(fecha.getTime())) return null
  return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
}

function TarjetaInstancias({ titulo, notas, fechas, reglas, resultado, tipo, onAbrirNota }) {
  const visibles = contarInstanciasVisibles(notas, reglas, { esParcial: tipo === 'parcial' })
  const etiqueta = tipo === 'parcial' ? etiquetaInstanciaParcial : etiquetaInstanciaFinal
  const intentos = notas.filter((n) => n != null).length
  // El chip "extra" del recu 1 opcional para promocionar (ver evaluarParcial
  // en utils/cursada.js): el original aprobó por debajo de la nota de
  // promoción y hay un primer recu disponible para intentarla igual.
  const esRecuOpcionalPromocion =
    tipo === 'parcial' &&
    notas[0] != null &&
    notas[0] >= reglas.notaAprobacion &&
    notas[0] < reglas.notaPromocion &&
    reglas.permitePromocion &&
    notas.length > 1
  // Fecha de la última instancia cargada (nota o solo fecha, lo que haya).
  const ultimaFecha = formatearFecha(
    [...(fechas ?? [])]
      .slice(0, visibles)
      .reverse()
      .find((f) => f != null),
  )

  let estadoTexto = 'Sin rendir'
  let estadoClase = ''
  if (resultado.aprobado) {
    estadoTexto = `Aprobado con ${resultado.notaAprobacion}`
    estadoClase = 'ok'
  } else if (resultado.agotado) {
    estadoTexto = 'Sin aprobar'
    estadoClase = 'fail'
  }

  return (
    <div className="detalle-mobile-tarjeta">
      <div className="detalle-mobile-tarjeta-cabecera">
        <h3>{titulo}</h3>
        <span className={`detalle-mobile-tarjeta-estado ${estadoClase}`}>{estadoTexto}</span>
      </div>
      <div className="detalle-mobile-tarjeta-info">
        <span>
          <span className="material-symbols-outlined" aria-hidden="true">
            history
          </span>
          {intentos} intento{intentos === 1 ? '' : 's'}
        </span>
        {ultimaFecha && (
          <span>
            <span className="material-symbols-outlined" aria-hidden="true">
              calendar_today
            </span>
            {ultimaFecha}
          </span>
        )}
      </div>
      <div className="chips-nota-mobile">
        {Array.from({ length: visibles }, (_, indice) => {
          const nota = notas[indice]
          const clase = nota == null ? 'vacio' : nota >= reglas.notaAprobacion ? 'aprueba' : 'desaprueba'
          const fechaCorta = formatearFechaCorta(fechas?.[indice])
          return (
            <button
              key={indice}
              type="button"
              className={`chip-nota-mobile ${clase}`}
              onClick={() => onAbrirNota(indice)}
            >
              <span className="chip-nota-mobile-valor">{nota ?? '–'}</span>
              <span className="chip-nota-mobile-label">
                {etiqueta(indice)}
                {esRecuOpcionalPromocion && indice === 1 && ' · opcional, para promocionar'}
                {fechaCorta && ` · ${fechaCorta}`}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function MateriaDetalleMobile() {
  const { id } = useParams()
  const { materias, cargando, editarMateria } = useMaterias()
  const { reglasCarrera } = usePerfil()
  const materia = materias.find((m) => m.id === id)

  const { celebrar, elemento: celebracion } = useCelebracion()
  const [notaSheet, setNotaSheet] = useState(null)
  const [fechaSheet, setFechaSheet] = useState('')
  const [editarAbierto, setEditarAbierto] = useState(false)

  const reglas = materia && reglasCarrera ? calcularReglasEfectivas(materia, reglasCarrera) : null
  const evaluacion = reglas ? evaluarCursada(materia, reglas) : null
  const puntos = materia && reglas ? calcularPuntosMateria(materia, reglas) : null

  // Festeja el instante en que la materia PASA a promocionó/firmó (por nota
  // o por tick manual), no cada vez que la pantalla se abre ya estando así.
  const estadoAnteriorRef = useRef(evaluacion?.estado)
  useEffect(() => {
    const anterior = estadoAnteriorRef.current
    if (evaluacion && anterior !== evaluacion.estado && ESTADOS_FESTEJABLES.has(evaluacion.estado)) {
      celebrar('materia', {
        icono: 'emoji_events',
        titulo: evaluacion.estado === 'promocion' ? '¡Promocionaste!' : '¡Materia firmada!',
        subtitulo: `${materia.nombre} · +${puntos} pts`,
        boton: 'Continuar',
      })
    }
    estadoAnteriorRef.current = evaluacion?.estado
  }, [evaluacion, celebrar, materia, puntos])

  if (cargando) {
    return (
      <section className="page-mobile">
        <p className="page-placeholder">Cargando…</p>
      </section>
    )
  }

  if (!materia) {
    return (
      <section className="page-mobile">
        <p className="page-placeholder">No encontramos esa materia.</p>
        <Link to="/">‹ Materias</Link>
      </section>
    )
  }

  const muestraNotaMateria = evaluacion.estado === 'promocion' || evaluacion.estado === 'aprobada'
  const muestraFinal = evaluacion.resultadoFinal !== null
  const faltanHoras = materia.horasCatedra == null
  const poolBase = calcularPoolPuntos(materia.horasCatedra, reglas.puntosPorHora)
  const progreso = calcularProgresoMateria(materia, reglas)

  // `fechas` puede no existir todavía en materias creadas antes de este
  // campo (JSON viejo, sin esa clave) — se reconstruye con el mismo largo
  // que `notas` en vez de mapear directo sobre `p.fechas`, que si no existe
  // (o está más corta) no tiene índices para "crecer" con .map().
  const actualizarNotaParcial = (indiceParcial, indiceInstancia, valor, fecha) => {
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

  const actualizarNotaFinal = (indiceInstancia, valor, fecha) => {
    const nota = valor === '' || valor == null ? null : Number(valor)
    const notas = materia.final.notas.map((n, j) => (j === indiceInstancia ? nota : n))
    const fechasBase = Array.from({ length: materia.final.notas.length }, (_, j) => materia.final.fechas?.[j] ?? null)
    const fechas = fechasBase.map((f, j) => (j === indiceInstancia ? fecha || null : f))
    editarMateria(materia.id, { final: { notas, fechas } })
  }

  const handleTick = (valor) => {
    editarMateria(materia.id, { tickManual: materia.tickManual === valor ? null : valor })
  }

  const handleToggleEmpezada = () => {
    editarMateria(materia.id, { empezada: !materia.empezada })
  }

  // Hoy este checkbox solo existe en MateriaForm.jsx (alta/edición desde la
  // lista); acá se expone la misma acción (pool_override en 0/null) porque
  // tiene sentido revisarla justo al lado de la tarjeta de puntos.
  const handleToggleNoSumaPuntos = () => {
    editarMateria(materia.id, { poolOverride: materia.poolOverride === 0 ? null : 0 })
  }

  const handleNotaManual = (valor) => {
    editarMateria(materia.id, { notaMateriaManual: valor === '' ? null : Number(valor) })
  }

  const handleOverrideNumero = (campo, valor) => {
    editarMateria(materia.id, { [campo]: valor === '' ? null : Number(valor) })
  }

  const handlePermitePromocionOverride = (valor) => {
    editarMateria(materia.id, {
      permitePromocionOverride: materia.permitePromocionOverride === valor ? null : valor,
    })
  }

  const handlePromocionPorPromedioOverride = (valor) => {
    editarMateria(materia.id, {
      promocionPorPromedioOverride: materia.promocionPorPromedioOverride === valor ? null : valor,
    })
  }

  const handleEditarCampo = (campo, valor) => editarMateria(materia.id, { [campo]: valor })

  const handleVolverReglasCarrera = () => {
    editarMateria(materia.id, {
      notaAprobacionOverride: null,
      notaPromocionOverride: null,
      permitePromocionOverride: null,
      promocionPorPromedioOverride: null,
    })
  }

  const abrirNotaParcial = (indiceParcial) => (indiceInstancia) => {
    setNotaSheet({ tipo: 'parcial', parcialIdx: indiceParcial, instanciaIdx: indiceInstancia })
    setFechaSheet(materia.parciales[indiceParcial]?.fechas?.[indiceInstancia] ?? '')
  }
  const abrirNotaFinal = (indiceInstancia) => {
    setNotaSheet({ tipo: 'final', instanciaIdx: indiceInstancia })
    setFechaSheet(materia.final.fechas?.[indiceInstancia] ?? '')
  }

  const elegirNota = (valor) => {
    if (notaSheet.tipo === 'parcial') actualizarNotaParcial(notaSheet.parcialIdx, notaSheet.instanciaIdx, valor, fechaSheet)
    else actualizarNotaFinal(notaSheet.instanciaIdx, valor, fechaSheet)
    setNotaSheet(null)
  }

  const borrarNota = () => {
    if (notaSheet.tipo === 'parcial') actualizarNotaParcial(notaSheet.parcialIdx, notaSheet.instanciaIdx, '', null)
    else actualizarNotaFinal(notaSheet.instanciaIdx, '', null)
    setNotaSheet(null)
  }

  // Cambiar la fecha sin tocar la nota persiste enseguida (con la nota que
  // ya hubiera en esa instancia) — no hace falta volver a tocar la grilla
  // para que la fecha quede guardada.
  const cambiarFechaSheet = (valor) => {
    setFechaSheet(valor)
    const notaActual =
      notaSheet.tipo === 'parcial'
        ? materia.parciales[notaSheet.parcialIdx].notas[notaSheet.instanciaIdx]
        : materia.final.notas[notaSheet.instanciaIdx]
    if (notaSheet.tipo === 'parcial') actualizarNotaParcial(notaSheet.parcialIdx, notaSheet.instanciaIdx, notaActual, valor)
    else actualizarNotaFinal(notaSheet.instanciaIdx, notaActual, valor)
  }

  const tituloNotaSheet = notaSheet
    ? notaSheet.tipo === 'parcial'
      ? `Parcial ${notaSheet.parcialIdx + 1} · ${etiquetaInstanciaParcial(notaSheet.instanciaIdx).toLowerCase()}`
      : `Final · instancia ${notaSheet.instanciaIdx + 1}`
    : ''

  const ayudaNotaSheet = notaSheet
    ? notaSheet.tipo === 'parcial'
      ? reglas.permitePromocion
        ? reglas.promocionPorPromedio
          ? `Se aprueba con ${reglas.notaAprobacion} o más. Si el promedio de los parciales llega a ${reglas.notaPromocion}, promociona.`
          : `Se aprueba con ${reglas.notaAprobacion} o más. Con ${reglas.notaPromocion} en el original o el primer recu, promociona.`
        : `Se aprueba con ${reglas.notaAprobacion} o más. Esta materia no permite promoción.`
      : `Se aprueba con ${reglas.notaAprobacion} o más.`
    : ''

  const intentosFinal = muestraFinal ? materia.final.notas.filter((n) => n != null).length : 0
  const restantesFinal = muestraFinal ? materia.final.notas.length - intentosFinal : 0

  const resumenReglas = `Aprueba ${reglas.notaAprobacion} · promo ${reglas.permitePromocion ? reglas.notaPromocion : 'no'}`

  return (
    <section className="page-mobile detalle-mobile">
      {celebracion}
      <Link to="/" className="detalle-mobile-volver">
        ‹ Materias
      </Link>

      <div className="detalle-mobile-titulo-bloque">
        <h1>{materia.nombre}</h1>
        <div className="detalle-mobile-meta-row">
          <MateriaBadge estado={evaluacion.estado} compacto manual={materia.tickManual != null} />
          {faltanHoras ? (
            <span className="detalle-mobile-aviso">Faltan las horas cátedra</span>
          ) : (
            <span className="detalle-mobile-meta">
              {materia.horasCatedra} hs cátedra · {materia.cantidadParciales} parciales
              {materia.notaMateriaManual != null && ` · nota final ${materia.notaMateriaManual}`}
            </span>
          )}
        </div>
        <div className="detalle-mobile-manuales">
          <button
            type="button"
            className={materia.tickManual === 'promocion' ? 'detalle-mobile-manual-boton activo' : 'detalle-mobile-manual-boton'}
            onClick={() => handleTick('promocion')}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              toggle_on
            </span>
            Marcar Promoción manual
          </button>
          <button
            type="button"
            className={materia.tickManual === 'firma' ? 'detalle-mobile-manual-boton activo' : 'detalle-mobile-manual-boton'}
            onClick={() => handleTick('firma')}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              toggle_on
            </span>
            Marcar Firma manual
          </button>
        </div>
      </div>

      <button type="button" className="detalle-mobile-editar-fila" onClick={() => setEditarAbierto(true)}>
        <span className="material-symbols-outlined detalle-mobile-editar-icono" aria-hidden="true">
          tune
        </span>
        <span className="detalle-mobile-editar-label">Editar materia</span>
        <span className="detalle-mobile-editar-resumen">{resumenReglas}</span>
        <span className="material-symbols-outlined detalle-mobile-editar-chevron" aria-hidden="true">
          chevron_right
        </span>
      </button>

      <div className="detalle-mobile-progreso">
        <div className="detalle-mobile-progreso-cabecera">
          <span>Progreso de la materia</span>
          <span className="detalle-mobile-progreso-valor">{progreso}%</span>
        </div>
        <div className="detalle-mobile-progreso-riel">
          <div className="detalle-mobile-progreso-relleno" style={{ width: `${progreso}%` }} />
        </div>
      </div>

      <div className="detalle-mobile-puntos">
        <span className="detalle-mobile-puntos-icono" aria-hidden="true">
          <span className="material-symbols-outlined relleno">stars</span>
        </span>
        <div className="detalle-mobile-puntos-info">
          <span className="detalle-mobile-puntos-label">Puntos de esta materia</span>
          <span className="detalle-mobile-puntos-detalle">
            Pool base {poolBase}
            {evaluacion.estado === 'promocion' && ' · +50% por promoción'}
            {evaluacion.estado === 'aprobada' && ' · +25% por final'}
          </span>
        </div>
        <span className="detalle-mobile-puntos-valor">{puntos}</span>
      </div>

      <label className="detalle-mobile-checkbox">
        <input type="checkbox" checked={materia.poolOverride === 0} onChange={handleToggleNoSumaPuntos} />
        No sumar puntos de esta materia (ya la tenía aprobada antes de usar la app)
      </label>

      {evaluacion.estado === 'pendiente' && (
        <button type="button" className="detalle-mobile-boton-primario" onClick={handleToggleEmpezada}>
          Empezar a cursar
        </button>
      )}
      {evaluacion.estado === 'cursando' && (
        <button type="button" className="detalle-mobile-boton-secundario" onClick={handleToggleEmpezada}>
          Volver a pendiente
        </button>
      )}

      <section className="mobile-seccion">
        <h4 className="seccion-mobile-label">Parciales</h4>
        <div className="detalle-mobile-tarjetas">
          {materia.parciales.map((parcial, indice) => (
            <TarjetaInstancias
              key={indice}
              titulo={`Parcial ${indice + 1}`}
              notas={parcial.notas}
              fechas={parcial.fechas}
              reglas={reglas}
              resultado={evaluacion.resultadoParciales.resultados[indice]}
              tipo="parcial"
              onAbrirNota={abrirNotaParcial(indice)}
            />
          ))}
        </div>
      </section>

      {muestraFinal && (
        <section className="mobile-seccion">
          <h4 className="seccion-mobile-label">Final</h4>
          <p className="detalle-mobile-ayuda">
            {evaluacion.estado === 'aprobada' ? 'Final aprobado.' : `Firmaste: te quedan ${restantesFinal} instancias de final.`}
          </p>
          <div className="detalle-mobile-tarjetas">
            <TarjetaInstancias
              titulo="Final"
              notas={materia.final.notas}
              fechas={materia.final.fechas}
              reglas={reglas}
              resultado={evaluacion.resultadoFinal}
              tipo="final"
              onAbrirNota={abrirNotaFinal}
            />
          </div>
        </section>
      )}

      {muestraNotaMateria && (
        <section className="mobile-seccion">
          <div className="nota-final-cabecera">
            <h4 className="seccion-mobile-label nota-final-label">Nota final de la materia</h4>
            <span className="nota-final-estado">{materia.notaMateriaManual != null ? 'Cargada' : 'Sin cargar'}</span>
          </div>
          <div className="detalle-mobile-tarjeta">
            <div className="nota-final-grilla">
              {NOTAS_FINAL_MATERIA.map((nota) => (
                <button
                  key={nota}
                  type="button"
                  className={materia.notaMateriaManual === nota ? 'nota-final-celda activa' : 'nota-final-celda'}
                  onClick={() => handleNotaManual(nota)}
                >
                  {nota}
                </button>
              ))}
              <button
                type="button"
                className={
                  materia.notaMateriaManual == null ? 'nota-final-celda sin-nota activa' : 'nota-final-celda sin-nota'
                }
                onClick={() => handleNotaManual('')}
              >
                Sin nota
              </button>
            </div>
          </div>
        </section>
      )}

      <BottomSheet abierto={notaSheet != null} onCerrar={() => setNotaSheet(null)} titulo={tituloNotaSheet}>
        {notaSheet && (
          <HojaNota
            ayuda={ayudaNotaSheet}
            notaAprobacion={reglas.notaAprobacion}
            fecha={fechaSheet}
            onCambiarFecha={cambiarFechaSheet}
            onElegir={elegirNota}
            onBorrar={borrarNota}
          />
        )}
      </BottomSheet>

      <BottomSheet
        abierto={editarAbierto}
        onCerrar={() => setEditarAbierto(false)}
        titulo="Editar materia"
        altoMax={88}
        footer={
          <button type="button" className="boton-primario-mobile" onClick={() => setEditarAbierto(false)}>
            Listo
          </button>
        }
      >
        {editarAbierto && (
          <HojaEditarMateria
            materia={materia}
            reglas={reglas}
            onEditarCampo={handleEditarCampo}
            onOverrideNumero={handleOverrideNumero}
            onPermitePromocionOverride={handlePermitePromocionOverride}
            onPromocionPorPromedioOverride={handlePromocionPorPromedioOverride}
            onTick={handleTick}
            onToggleNoSumaPuntos={handleToggleNoSumaPuntos}
            onVolverReglasCarrera={handleVolverReglasCarrera}
          />
        )}
      </BottomSheet>
    </section>
  )
}

export default MateriaDetalleMobile
