import { Link } from 'react-router-dom'
import BottomSheet from '../components/BottomSheet.jsx'
import HojaNuevaMateria from '../components/HojaNuevaMateria.jsx'
import MateriaBadge from '../components/MateriaBadge.jsx'
import { usePerfil } from '../context/usePerfil.js'
import { useHorasPorClase } from '../hooks/useHorasPorClase'
import { useMaterias } from '../hooks/useMaterias.js'
import { nombreAnio } from '../utils/anio'
import { evaluarCursada } from '../utils/cursada'
import { calcularPoolPuntos } from '../utils/puntos'
import { calcularPuntosMateria } from '../utils/puntosMateria'
import { calcularReglasEfectivas } from '../utils/reglasMateria'
import { FILTROS_VACIOS, RANGOS_HORAS, materiaCoincideFiltros } from '../utils/filtrosMaterias'
import {
  DEFAULT_CANTIDAD_INSTANCIAS_FINAL,
  DEFAULT_CANTIDAD_PARCIALES,
  DEFAULT_CANTIDAD_RECUPERATORIOS,
  RANGO_HORAS_UMBRAL_1,
  RANGO_HORAS_UMBRAL_2,
} from '../constants'
import { useState } from 'react'
import './MateriasMobile.css'

const HORAS_CATEDRA_DEFAULT_NUEVA = 128

function valoresNuevaMateria() {
  return {
    nombre: '',
    anioCursada: 1,
    horasCatedra: HORAS_CATEDRA_DEFAULT_NUEVA,
    cantidadParciales: DEFAULT_CANTIDAD_PARCIALES,
    cantidadRecuperatorios: DEFAULT_CANTIDAD_RECUPERATORIOS,
    cantidadInstanciasFinal: DEFAULT_CANTIDAD_INSTANCIAS_FINAL,
    noSumaPuntos: false,
  }
}

// Mismas 4 opciones agrupadas que ya usa materiaCoincideFiltros (ver
// utils/filtrosMaterias.js) — se repiten acá solo como lista para la hoja,
// la lógica de coincidencia sigue siendo la del util.
const OPCIONES_ESTADO = [
  { valor: 'aprobada', etiqueta: 'Aprobada' },
  { valor: 'firmada', etiqueta: 'Firmada' },
  { valor: 'cursando', etiqueta: 'Cursando' },
  { valor: 'pendiente', etiqueta: 'Pendiente' },
]

// Etiquetas más amigables que el "0-99" de escritorio, pero mismos `valor`
// (bajo/medio/alto) para que materiaCoincideFiltros los reconozca igual.
const ETIQUETAS_HORAS_MOBILE = {
  bajo: `Menos de ${RANGO_HORAS_UMBRAL_1}`,
  medio: `${RANGO_HORAS_UMBRAL_1} a ${RANGO_HORAS_UMBRAL_2 - 1}`,
  alto: `${RANGO_HORAS_UMBRAL_2} o más`,
}

function esAprobada(estado) {
  return estado === 'aprobada' || estado === 'promocion'
}

// Calculadora Total/Por-clase de la hoja "Cargar horas cátedra" (selección
// masiva). El total en sí vive en el padre (para que el botón "Aplicar" del
// footer, que se renderiza fuera de este componente, lo pueda leer); acá
// solo vive el modo "por clase" y sus dos campos, efímeros. Como este
// componente solo se monta mientras la hoja está abierta, arranca limpio
// cada vez, sin arrastrar el modo o los números de la vez anterior.
function CalculadoraHorasMasivas({ horasCatedra, onCambiarHorasCatedra }) {
  const { porClase, horasPorClase, cantidadClases, handleHorasPorClaseChange, handleCantidadClasesChange, handleTogglePorClase } =
    useHorasPorClase(onCambiarHorasCatedra)

  return (
    <div className="hoja-materia-campo">
      {porClase ? (
        <>
          <div className="hoja-materia-campo-cabecera">
            <span className="hoja-materia-label">Horas por clase</span>
            <input
              type="number"
              min="0"
              step="0.5"
              className="hoja-materia-input-chico"
              value={horasPorClase}
              onChange={handleHorasPorClaseChange}
              placeholder="2"
            />
          </div>
          <div className="hoja-materia-campo-cabecera">
            <span className="hoja-materia-label">Cantidad de clases</span>
            <input
              type="number"
              min="1"
              step="1"
              className="hoja-materia-input-chico"
              value={cantidadClases}
              onChange={handleCantidadClasesChange}
              placeholder="34"
            />
          </div>
          <p className="hoja-materia-ayuda">
            Total de clases en todo el período (ej: 2 veces por semana × 17 semanas = 34).
          </p>
          <p className="hoja-materia-ayuda">= {horasCatedra || 0} hs cátedra</p>
        </>
      ) : (
        <div className="hoja-materia-campo-cabecera">
          <span className="hoja-materia-label">Horas cátedra</span>
          <input
            type="number"
            min="1"
            className="hoja-materia-input-chico"
            value={horasCatedra}
            onChange={(e) => onCambiarHorasCatedra(e.target.value)}
            placeholder="128"
          />
        </div>
      )}

      <button type="button" className="hoja-materia-switch-fila hoja-materia-horas-switch" onClick={handleTogglePorClase}>
        <span className="hoja-materia-switch-texto">
          <span className="hoja-materia-label">Cargar por clase</span>
          <span className="hoja-materia-ayuda">Horas por clase × cantidad de clases, en vez del total.</span>
        </span>
        <span className={porClase ? 'hoja-materia-switch activo' : 'hoja-materia-switch'} aria-hidden="true">
          <span className="hoja-materia-switch-perilla" />
        </span>
      </button>
    </div>
  )
}

function agruparPorAnio(items) {
  const grupos = new Map()
  for (const item of items) {
    const grupo = grupos.get(item.materia.anioCursada) ?? []
    grupo.push(item)
    grupos.set(item.materia.anioCursada, grupo)
  }
  return [...grupos.entries()]
    .sort(([anioA], [anioB]) => anioA - anioB)
    .map(([anio, grupo]) => [anio, grupo.slice().sort((a, b) => a.materia.nombre.localeCompare(b.materia.nombre))])
}

function MateriasMobile() {
  const { materias, cargando, agregarMateria, editarMateria } = useMaterias()
  const { reglasCarrera } = usePerfil()
  const [filtros, setFiltros] = useState(FILTROS_VACIOS)
  const [filtroSheet, setFiltroSheet] = useState(null)
  const [nuevaMateria, setNuevaMateria] = useState(null)
  const [anioRecienAgregado, setAnioRecienAgregado] = useState(null)

  // Selección múltiple para cargar la misma carga horaria a varias materias
  // de una sola vez (ver sección "3" del handoff — carga masiva).
  const [modoSeleccion, setModoSeleccion] = useState(false)
  const [seleccionadas, setSeleccionadas] = useState(new Set())
  const [sheetHorasAbierto, setSheetHorasAbierto] = useState(false)
  const [horasCatedraMasivo, setHorasCatedraMasivo] = useState('')
  const [aplicandoMasivo, setAplicandoMasivo] = useState(false)

  if (cargando) {
    return (
      <section className="page-mobile">
        <h1>Materias</h1>
        <p className="page-placeholder">Cargando…</p>
      </section>
    )
  }

  const enriquecidas = materias.map((materia) => {
    const reglas = calcularReglasEfectivas(materia, reglasCarrera)
    return { materia, reglas, evaluacion: evaluarCursada(materia, reglas), puntos: calcularPuntosMateria(materia, reglas) }
  })

  const filtrosActivos = filtros.anios.length > 0 || filtros.rangosHoras.length > 0 || filtros.estados.length > 0
  const coincide = ({ materia }) => materiaCoincideFiltros(materia, filtros, reglasCarrera)
  const totalAprobadas = enriquecidas.filter(({ evaluacion }) => esAprobada(evaluacion.estado)).length
  const totalCoincidentes = enriquecidas.filter(coincide).length

  const aniosPresentes = [...new Set(materias.map((m) => m.anioCursada))].sort((a, b) => a - b)
  const opcionesAnios = aniosPresentes.map((anio) => ({ valor: String(anio), etiqueta: `${nombreAnio(anio)} año` }))
  const opcionesHoras = RANGOS_HORAS.map((r) => ({ valor: r.valor, etiqueta: ETIQUETAS_HORAS_MOBILE[r.valor] }))

  const CATEGORIAS = [
    { key: 'anios', etiqueta: 'Año', opciones: opcionesAnios },
    { key: 'rangosHoras', etiqueta: 'Horas', opciones: opcionesHoras },
    { key: 'estados', etiqueta: 'Estado', opciones: OPCIONES_ESTADO },
  ]

  const toggleFiltro = (categoria, valor) => {
    setFiltros((prev) => {
      const lista = prev[categoria]
      const yaEsta = lista.includes(valor)
      return { ...prev, [categoria]: yaEsta ? lista.filter((v) => v !== valor) : [...lista, valor] }
    })
  }

  const limpiarFiltros = () => setFiltros(FILTROS_VACIOS)

  const handleAbrirNuevaMateria = () => setNuevaMateria(valoresNuevaMateria())
  const handleCerrarNuevaMateria = () => setNuevaMateria(null)
  const handleCambiarNuevaMateria = (campo, valor) => setNuevaMateria((prev) => ({ ...prev, [campo]: valor }))

  const handleConfirmarNuevaMateria = () => {
    if (!nuevaMateria.nombre.trim()) return
    agregarMateria({
      nombre: nuevaMateria.nombre.trim(),
      anioCursada: nuevaMateria.anioCursada,
      horasCatedra: nuevaMateria.horasCatedra,
      cantidadParciales: nuevaMateria.cantidadParciales,
      cantidadRecuperatorios: nuevaMateria.cantidadRecuperatorios,
      cantidadInstanciasFinal: nuevaMateria.cantidadInstanciasFinal,
      poolOverride: nuevaMateria.noSumaPuntos ? 0 : null,
    })
    setAnioRecienAgregado(nuevaMateria.anioCursada)
    setNuevaMateria(null)
  }

  const handleActivarSeleccion = () => {
    setModoSeleccion(true)
    setSeleccionadas(new Set())
  }

  const handleCancelarSeleccion = () => {
    setModoSeleccion(false)
    setSeleccionadas(new Set())
  }

  const handleToggleSeleccion = (id) => {
    setSeleccionadas((prev) => {
      const siguiente = new Set(prev)
      if (siguiente.has(id)) siguiente.delete(id)
      else siguiente.add(id)
      return siguiente
    })
  }

  const handleAbrirCargaHoras = () => {
    setHorasCatedraMasivo('')
    setSheetHorasAbierto(true)
  }

  const handleCerrarCargaHoras = () => setSheetHorasAbierto(false)

  const handleAplicarHorasMasivo = async () => {
    const horas = Number(horasCatedraMasivo)
    if (!Number.isFinite(horas) || horas <= 0) return

    setAplicandoMasivo(true)
    await Promise.all([...seleccionadas].map((id) => editarMateria(id, { horasCatedra: horas })))
    setAplicandoMasivo(false)
    setSheetHorasAbierto(false)
    handleCancelarSeleccion()
  }

  const grupos = agruparPorAnio(enriquecidas)

  return (
    <section className="page-mobile materias-mobile">
      <div className="materias-mobile-encabezado">
        <h1>Materias</h1>
        {materias.length > 0 && (
          <span className="materias-mobile-conteo">
            {filtrosActivos ? `${totalCoincidentes} de ${materias.length} materias` : `${totalAprobadas} de ${materias.length} aprobadas`}
          </span>
        )}
      </div>

      <div className="materias-mobile-acciones">
        {!modoSeleccion ? (
          <>
            <button type="button" className="boton-primario-mobile materias-mobile-agregar" onClick={handleAbrirNuevaMateria}>
              + Agregar materia
            </button>
            {materias.length > 0 && (
              <button type="button" className="materias-mobile-seleccionar" onClick={handleActivarSeleccion}>
                Seleccionar
              </button>
            )}
          </>
        ) : (
          <button type="button" className="materias-mobile-seleccionar" onClick={handleCancelarSeleccion}>
            Cancelar selección
          </button>
        )}
      </div>

      {materias.length === 0 ? (
        <p className="page-placeholder">Todavía no cargaste ninguna materia.</p>
      ) : (
        <>
          <div className="filtros-mobile">
            {CATEGORIAS.map((categoria) => {
              const cantidad = filtros[categoria.key].length
              return (
                <button
                  key={categoria.key}
                  type="button"
                  className={cantidad > 0 ? 'chip-filtro-mobile activo' : 'chip-filtro-mobile'}
                  onClick={() => setFiltroSheet(categoria.key)}
                >
                  {categoria.etiqueta}
                  {cantidad > 0 && <span className="chip-filtro-mobile-contador">{cantidad}</span>}
                </button>
              )
            })}
            {filtrosActivos && (
              <button type="button" className="chip-filtro-mobile-limpiar" onClick={limpiarFiltros}>
                Limpiar
              </button>
            )}
          </div>

          {filtrosActivos && totalCoincidentes === 0 ? (
            <div className="materias-mobile-vacio">
              <p>Ninguna materia coincide con los filtros</p>
              <button type="button" onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="materias-mobile-lista">
              {grupos.map(([anio, items]) => {
                const itemsVisibles = filtrosActivos ? items.filter(coincide) : items
                if (filtrosActivos && itemsVisibles.length === 0) return null

                const aprobadasAnio = items.filter(({ evaluacion }) => esAprobada(evaluacion.estado)).length
                const porcentaje = items.length ? Math.round((aprobadasAnio / items.length) * 100) : 0
                const forzarAbierto = anioRecienAgregado === anio

                return (
                  <details
                    key={`${anio}-${filtrosActivos}-${forzarAbierto}`}
                    className="anio-card-mobile"
                    open={filtrosActivos || forzarAbierto}
                  >
                    <summary className="anio-card-mobile-cabecera">
                      <div className="anio-card-mobile-info">
                        <div className="anio-card-mobile-titulo-row">
                          <span className="anio-card-mobile-titulo">{nombreAnio(anio)} año</span>
                          <span className="anio-card-mobile-conteo">
                            {aprobadasAnio}/{items.length} aprobadas
                          </span>
                        </div>
                        <div className="anio-card-mobile-barra">
                          <div className="anio-card-mobile-relleno" style={{ width: `${porcentaje}%` }} />
                        </div>
                      </div>
                      <span className="anio-card-mobile-chevron" aria-hidden="true">
                        ▾
                      </span>
                    </summary>

                    <ul className="anio-card-mobile-lista">
                      {itemsVisibles.map(({ materia, reglas, evaluacion, puntos }) => {
                        const faltanHoras = materia.horasCatedra == null
                        const marcada = seleccionadas.has(materia.id)
                        const contenido = (
                          <>
                            {modoSeleccion && (
                              <span className={marcada ? 'materia-fila-mobile-tilde marcada' : 'materia-fila-mobile-tilde'} aria-hidden="true">
                                {marcada && '✓'}
                              </span>
                            )}
                            <div className="materia-fila-mobile-info">
                              <span className="materia-fila-mobile-nombre">{materia.nombre}</span>
                              <div className="materia-fila-mobile-meta-row">
                                <MateriaBadge estado={evaluacion.estado} compacto />
                                {faltanHoras ? (
                                  <span className="materia-fila-mobile-aviso">Faltan las horas cátedra</span>
                                ) : (
                                  <span className="materia-fila-mobile-meta">
                                    {materia.horasCatedra} hs · pool{' '}
                                    {calcularPoolPuntos(materia.horasCatedra, reglas.puntosPorHora)}
                                  </span>
                                )}
                              </div>
                            </div>
                            {!modoSeleccion && (
                              <>
                                {puntos > 0 && <span className="materia-fila-mobile-puntos">+{puntos}</span>}
                                <span className="materia-fila-mobile-chevron" aria-hidden="true">
                                  ›
                                </span>
                              </>
                            )}
                          </>
                        )
                        return (
                          <li key={materia.id}>
                            {modoSeleccion ? (
                              <button
                                type="button"
                                className="materia-fila-mobile"
                                onClick={() => handleToggleSeleccion(materia.id)}
                              >
                                {contenido}
                              </button>
                            ) : (
                              <Link to={`/materias/${materia.id}`} className="materia-fila-mobile">
                                {contenido}
                              </Link>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </details>
                )
              })}
            </div>
          )}
        </>
      )}

      {seleccionadas.size > 0 && (
        <div className="materias-mobile-seleccion-barra">
          <span className="materias-mobile-seleccion-texto">
            {seleccionadas.size} seleccionada{seleccionadas.size === 1 ? '' : 's'}
          </span>
          <button type="button" className="materias-mobile-seleccion-boton" onClick={handleAbrirCargaHoras}>
            Cargar horas
          </button>
        </div>
      )}

      <BottomSheet
        abierto={filtroSheet != null}
        onCerrar={() => setFiltroSheet(null)}
        titulo={CATEGORIAS.find((c) => c.key === filtroSheet)?.etiqueta}
      >
        {filtroSheet && (
          <>
            <ul className="filtro-sheet-lista">
              {CATEGORIAS.find((c) => c.key === filtroSheet).opciones.map((opcion) => {
                const marcado = filtros[filtroSheet].includes(opcion.valor)
                return (
                  <li key={opcion.valor}>
                    <button
                      type="button"
                      className={marcado ? 'filtro-sheet-opcion marcada' : 'filtro-sheet-opcion'}
                      onClick={() => toggleFiltro(filtroSheet, opcion.valor)}
                    >
                      <span className="filtro-sheet-tilde" aria-hidden="true">
                        {marcado && '✓'}
                      </span>
                      {opcion.etiqueta}
                    </button>
                  </li>
                )
              })}
            </ul>
            <button type="button" className="filtro-sheet-boton-ver" onClick={() => setFiltroSheet(null)}>
              Ver {totalCoincidentes} materias
            </button>
          </>
        )}
      </BottomSheet>

      <BottomSheet
        abierto={nuevaMateria != null}
        onCerrar={handleCerrarNuevaMateria}
        titulo="Nueva materia"
        altoMax={88}
        footer={
          nuevaMateria && (
            <button
              type="button"
              className="boton-primario-mobile"
              disabled={!nuevaMateria.nombre.trim()}
              onClick={handleConfirmarNuevaMateria}
            >
              {nuevaMateria.nombre.trim() ? 'Agregar materia' : 'Ponele un nombre'}
            </button>
          )
        }
      >
        {nuevaMateria && (
          <HojaNuevaMateria
            form={nuevaMateria}
            aniosDisponibles={aniosPresentes}
            puntosPorHora={reglasCarrera.puntosPorHora}
            onCambiar={handleCambiarNuevaMateria}
          />
        )}
      </BottomSheet>

      <BottomSheet
        abierto={sheetHorasAbierto}
        onCerrar={handleCerrarCargaHoras}
        titulo="Cargar horas cátedra"
        footer={
          <button
            type="button"
            className="boton-primario-mobile"
            disabled={aplicandoMasivo || !(Number(horasCatedraMasivo) > 0)}
            onClick={handleAplicarHorasMasivo}
          >
            Aplicar a {seleccionadas.size} materia{seleccionadas.size === 1 ? '' : 's'}
          </button>
        }
      >
        {sheetHorasAbierto && (
          <CalculadoraHorasMasivas horasCatedra={horasCatedraMasivo} onCambiarHorasCatedra={setHorasCatedraMasivo} />
        )}
      </BottomSheet>
    </section>
  )
}

export default MateriasMobile
