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
import { FILTROS_VACIOS, HORAS_CATEDRA_MAX, materiaCoincideFiltros } from '../utils/filtrosMaterias'
import {
  DEFAULT_CANTIDAD_INSTANCIAS_FINAL,
  DEFAULT_CANTIDAD_PARCIALES,
  DEFAULT_CANTIDAD_RECUPERATORIOS,
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
// la lógica de coincidencia sigue siendo la del util. La clase da el color
// semántico del chip (ver MateriasMobile.css).
const OPCIONES_ESTADO = [
  { valor: 'pendiente', etiqueta: 'Pendiente', clase: 'pendiente' },
  { valor: 'cursando', etiqueta: 'Cursando', clase: 'cursando' },
  { valor: 'firmada', etiqueta: 'Firmada', clase: 'firma' },
  { valor: 'aprobada', etiqueta: 'Aprobada', clase: 'aprobada' },
]

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
  // Separado de `filtros` a propósito: ver el comentario de FILTROS_VACIOS
  // en utils/filtrosMaterias.js — no puede vivir en ese objeto sin romper
  // el desktop.
  const [horasMax, setHorasMax] = useState(null)
  const [filtroSheetAbierto, setFiltroSheetAbierto] = useState(false)
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

  const filtrosActivos = filtros.anios.length > 0 || horasMax != null || filtros.estados.length > 0
  const coincide = ({ materia }) => materiaCoincideFiltros(materia, filtros, reglasCarrera, horasMax)
  const totalAprobadas = enriquecidas.filter(({ evaluacion }) => esAprobada(evaluacion.estado)).length
  const totalCoincidentes = enriquecidas.filter(coincide).length
  const cantidadFiltrosActivos = filtros.anios.length + filtros.estados.length + (horasMax != null ? 1 : 0)

  const aniosPresentes = [...new Set(materias.map((m) => m.anioCursada))].sort((a, b) => a - b)
  const opcionesAnios = aniosPresentes.map((anio) => ({ valor: String(anio), etiqueta: `${nombreAnio(anio)} año` }))

  const toggleFiltro = (categoria, valor) => {
    setFiltros((prev) => {
      const lista = prev[categoria]
      const yaEsta = lista.includes(valor)
      return { ...prev, [categoria]: yaEsta ? lista.filter((v) => v !== valor) : [...lista, valor] }
    })
  }

  // El slider llega hasta HORAS_CATEDRA_MAX; en ese tope el filtro se
  // considera "sin límite" (horasMax en null) en vez de comparar contra un
  // número que ninguna materia real supera.
  const cambiarHorasMax = (valor) => {
    const numero = Number(valor)
    setHorasMax(numero >= HORAS_CATEDRA_MAX ? null : numero)
  }

  const limpiarFiltros = () => {
    setFiltros(FILTROS_VACIOS)
    setHorasMax(null)
  }

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
            <button
              type="button"
              className={cantidadFiltrosActivos > 0 ? 'chip-filtro-mobile activo' : 'chip-filtro-mobile'}
              onClick={() => setFiltroSheetAbierto(true)}
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                tune
              </span>
              Filtros
              {cantidadFiltrosActivos > 0 && <span className="chip-filtro-mobile-contador">{cantidadFiltrosActivos}</span>}
            </button>
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
        abierto={filtroSheetAbierto}
        onCerrar={() => setFiltroSheetAbierto(false)}
        titulo="Filtros"
        footer={
          <button type="button" className="boton-primario-mobile" onClick={() => setFiltroSheetAbierto(false)}>
            Ver {totalCoincidentes} materias
          </button>
        }
      >
        <div className="filtro-panel-seccion">
          <h4 className="filtro-panel-titulo">Año</h4>
          <div className="filtro-panel-chips">
            {opcionesAnios.map((opcion) => (
              <button
                key={opcion.valor}
                type="button"
                className={filtros.anios.includes(opcion.valor) ? 'filtro-chip activo' : 'filtro-chip'}
                onClick={() => toggleFiltro('anios', opcion.valor)}
              >
                {opcion.etiqueta}
              </button>
            ))}
          </div>
        </div>

        <div className="filtro-panel-seccion">
          <h4 className="filtro-panel-titulo">Estado</h4>
          <div className="filtro-panel-chips">
            {OPCIONES_ESTADO.map((opcion) => {
              const marcado = filtros.estados.includes(opcion.valor)
              return (
                <button
                  key={opcion.valor}
                  type="button"
                  className={
                    marcado
                      ? `filtro-chip-estado ${opcion.clase} activo`
                      : `filtro-chip-estado ${opcion.clase}`
                  }
                  onClick={() => toggleFiltro('estados', opcion.valor)}
                >
                  <span className="filtro-chip-estado-punto" aria-hidden="true" />
                  {opcion.etiqueta}
                </button>
              )
            })}
          </div>
        </div>

        <div className="filtro-panel-seccion">
          <div className="filtro-panel-horas-cabecera">
            <h4 className="filtro-panel-titulo">Horas cátedra</h4>
            <span className="filtro-panel-horas-valor">
              {horasMax == null ? `Hasta ${HORAS_CATEDRA_MAX}h+` : `Hasta ${horasMax}h`}
            </span>
          </div>
          <input
            type="range"
            className="filtro-panel-slider"
            min="0"
            max={HORAS_CATEDRA_MAX}
            step="8"
            value={horasMax ?? HORAS_CATEDRA_MAX}
            onChange={(e) => cambiarHorasMax(e.target.value)}
            aria-label="Horas cátedra máximas"
          />
          <div className="filtro-panel-horas-limites">
            <span>0h</span>
            <span>{HORAS_CATEDRA_MAX}h+</span>
          </div>
        </div>
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
