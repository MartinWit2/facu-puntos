import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import { usePerfil } from '../context/usePerfil.js'
import { useMaterias } from '../hooks/useMaterias.js'
import {
  DEFAULT_NOTA_APROBACION,
  DEFAULT_NOTA_PROMOCION,
  DEFAULT_PERMITE_PROMOCION,
  DEFAULT_PROMOCION_POR_PROMEDIO,
  DEFAULT_PUNTOS_POR_HORA,
} from '../constants'
import { contarMateriasConProgreso, tieneProgresoCargado } from '../utils/materiaEstructura'
import { calcularPuntosTotales } from '../utils/puntosMateria'
import './CarreraMobile.css'

// NFD + sacar los diacríticos (acentos, diéresis) para que buscar "abogaci"
// encuentre "Abogacía" sin tener que escribir la tilde.
function normalizar(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function agruparPorUniversidad(carreras) {
  const grupos = new Map()
  for (const carrera of carreras) {
    const grupo = grupos.get(carrera.universidad) ?? []
    grupo.push(carrera)
    grupos.set(carrera.universidad, grupo)
  }
  return [...grupos.entries()].sort(([a], [b]) => a.localeCompare(b))
}

const NOTAS_APROBACION = [4, 5, 6, 7, 8]
const NOTAS_PROMOCION = [6, 7, 8, 9, 10]

const REGLAS_DEFAULT = {
  nombre: '',
  notaAprobacion: DEFAULT_NOTA_APROBACION,
  notaPromocion: DEFAULT_NOTA_PROMOCION,
  permitePromocion: DEFAULT_PERMITE_PROMOCION,
  promocionPorPromedio: DEFAULT_PROMOCION_POR_PROMEDIO,
  puntosPorHora: DEFAULT_PUNTOS_POR_HORA,
}

// Mismo patrón visual que HojaEditarMateria.jsx (grilla de notas chicas +
// switch de permite-promoción), repetido acá en vez de importado porque esa
// hoja no expone estos subcomponentes y esta pantalla tiene su propia hoja
// de estilos.
function GrillaNotaChica({ valores, seleccionado, onElegir }) {
  return (
    <div className="carrera-mobile-grilla-chica">
      {valores.map((valor) => (
        <button
          key={valor}
          type="button"
          className={valor === seleccionado ? 'carrera-mobile-celda-chica activa' : 'carrera-mobile-celda-chica'}
          onClick={() => onElegir(valor)}
        >
          {valor}
        </button>
      ))}
    </div>
  )
}

// Formulario de reglas propias para quien no tiene una carrera fija: mismos
// cuatro valores que trae una fila de `carreras` (nota_aprobacion,
// nota_promocion, permite_promocion, puntos_por_hora), pero cargados a mano
// una sola vez y guardados en el perfil en vez de en el catálogo.
function FormReglasPropias({ reglas, onCambiar }) {
  return (
    <div className="carrera-mobile-reglas-form">
      <label className="carrera-mobile-campo">
        <span className="carrera-mobile-campo-label">Nombre</span>
        <input
          type="text"
          className="carrera-mobile-input-chico"
          placeholder="Cómo querés llamarla"
          value={reglas.nombre}
          onChange={(e) => onCambiar('nombre', e.target.value)}
        />
      </label>

      <div className="carrera-mobile-campo">
        <span className="carrera-mobile-campo-label">Nota de aprobación</span>
        <GrillaNotaChica
          valores={NOTAS_APROBACION}
          seleccionado={reglas.notaAprobacion}
          onElegir={(valor) => onCambiar('notaAprobacion', valor)}
        />
      </div>

      <button
        type="button"
        className="carrera-mobile-switch-fila"
        onClick={() => onCambiar('permitePromocion', !reglas.permitePromocion)}
      >
        <span className="carrera-mobile-switch-texto">
          <span className="carrera-mobile-campo-label">Permite promoción</span>
          <span className="carrera-mobile-campo-ayuda">
            {reglas.permitePromocion ? 'Se puede promocionar sin final.' : 'Siempre va a final.'}
          </span>
        </span>
        <span className={reglas.permitePromocion ? 'carrera-mobile-switch activo' : 'carrera-mobile-switch'} aria-hidden="true">
          <span className="carrera-mobile-switch-perilla" />
        </span>
      </button>

      {reglas.permitePromocion && (
        <>
          <div className="carrera-mobile-campo">
            <span className="carrera-mobile-campo-label">Nota de promoción</span>
            <GrillaNotaChica
              valores={NOTAS_PROMOCION}
              seleccionado={reglas.notaPromocion}
              onElegir={(valor) => onCambiar('notaPromocion', valor)}
            />
          </div>

          <button
            type="button"
            className="carrera-mobile-switch-fila"
            onClick={() => onCambiar('promocionPorPromedio', !reglas.promocionPorPromedio)}
          >
            <span className="carrera-mobile-switch-texto">
              <span className="carrera-mobile-campo-label">Promoción por promedio</span>
              <span className="carrera-mobile-campo-ayuda">
                {reglas.promocionPorPromedio
                  ? 'Promocionás si el promedio de los parciales llega a la nota de promoción.'
                  : 'Cada parcial tiene que llegar a la nota de promoción individualmente.'}
              </span>
            </span>
            <span
              className={reglas.promocionPorPromedio ? 'carrera-mobile-switch activo' : 'carrera-mobile-switch'}
              aria-hidden="true"
            >
              <span className="carrera-mobile-switch-perilla" />
            </span>
          </button>
        </>
      )}

      <label className="carrera-mobile-campo">
        <span className="carrera-mobile-campo-label">Puntos por hora cátedra</span>
        <input
          type="number"
          min="0.1"
          step="0.1"
          className="carrera-mobile-input-chico"
          value={reglas.puntosPorHora}
          onChange={(e) => onCambiar('puntosPorHora', Number(e.target.value) || 0)}
        />
      </label>
    </div>
  )
}

// Cubre los dos casos del repo (SeleccionCarrera de primera vez y
// CambiarCarrera) en un solo componente de tres pasos: el modo se deriva de
// `carreraElegida` de usePerfil(), no de una prop — así, renderizado sin
// chrome antes de elegir carrera (App.jsx) es "primera vez", y renderizado
// dentro del layout normal en /cambiar-carrera es "cambio". El destino
// elegido puede ser una carrera real o "sin carrera fija" (reglas propias,
// función nueva sin handoff de diseño): en ambos casos se pasa por el mismo
// paso de confirmación, con el mismo aviso de progreso perdido.
function CarreraMobile() {
  const { cerrarSesion } = useAuth()
  const {
    perfil,
    carreras,
    cargandoCarreras,
    carreraElegida,
    elegirCarrera,
    elegirSinCarrera,
    eligiendo,
    cambiarCarrera,
    cambiarASinCarrera,
    cambiandoCarrera,
    reglasCarrera,
    error,
  } = usePerfil()
  const { materias, cargando: cargandoMaterias } = useMaterias()
  const [busqueda, setBusqueda] = useState('')
  const [configurandoReglas, setConfigurandoReglas] = useState(false)
  const [reglasDraft, setReglasDraft] = useState(REGLAS_DEFAULT)
  const [destino, setDestino] = useState(null) // { tipo: 'carrera', carrera } | { tipo: 'sinCarrera', reglas } | null

  const esPrimeraVez = !carreraElegida
  const carreraActual = carreras.find((c) => c.id === perfil?.carrera_id)
  // Si no es primera vez y ninguna carrera del catálogo matchea, la carrera
  // actual es "sin carrera fija" (la única otra forma de tener carreraElegida).
  const actualmenteSinCarrera = !esPrimeraVez && !carreraActual
  const otrasCarreras = carreraActual ? carreras.filter((c) => c.id !== carreraActual.id) : carreras

  // Si la búsqueda matchea el nombre de una universidad entera, esa
  // universidad se sigue mostrando como burbuja colapsable con TODAS sus
  // carreras adentro (no una lista plana) — buscar "UADE" da la burbuja
  // "UADE", no sus carreras sueltas. Lo que sí va suelto en una lista plana
  // son las carreras cuyo nombre matchea pero cuya universidad no (para no
  // duplicar una carrera en las dos vistas a la vez).
  const q = normalizar(busqueda.trim())
  const gruposCompletos = agruparPorUniversidad(otrasCarreras)
  const gruposPorUniversidad = q ? gruposCompletos.filter(([universidad]) => normalizar(universidad).includes(q)) : []
  const universidadesConGrupo = new Set(gruposPorUniversidad.map(([universidad]) => universidad))
  const carrerasSueltas = q
    ? otrasCarreras.filter((c) => !universidadesConGrupo.has(c.universidad) && normalizar(c.nombre).includes(q))
    : []
  const grupos = q ? gruposPorUniversidad : gruposCompletos
  const sinResultados = q && gruposPorUniversidad.length === 0 && carrerasSueltas.length === 0
  const cargandoLista = cargandoCarreras || cargandoMaterias

  const handleAbrirReglas = () => {
    setReglasDraft(REGLAS_DEFAULT)
    setConfigurandoReglas(true)
  }

  const handleCambiarReglasDraft = (campo, valor) => setReglasDraft((prev) => ({ ...prev, [campo]: valor }))

  const handleConfirmarReglas = () => {
    if (!reglasDraft.nombre.trim()) return
    setConfigurandoReglas(false)
    setDestino({ tipo: 'sinCarrera', reglas: { ...reglasDraft, nombre: reglasDraft.nombre.trim() } })
  }

  const handleConfirmar = async () => {
    if (destino.tipo === 'sinCarrera') {
      if (esPrimeraVez) {
        await elegirSinCarrera(destino.reglas)
        return
      }
      try {
        await cambiarASinCarrera(destino.reglas)
        window.location.assign('/')
      } catch {
        // El error ya queda expuesto en el contexto (`error`).
      }
      return
    }

    if (esPrimeraVez) {
      // A diferencia de cambiarCarrera, elegirCarrera no necesita recarga
      // completa: no hay materias/reglas de una carrera vieja cacheadas en
      // otros hooks para limpiar, porque todavía no había ninguna.
      await elegirCarrera(destino.carrera.id)
      return
    }
    try {
      await cambiarCarrera(destino.carrera.id)
      // Recarga completa a propósito, igual que CambiarCarrera.jsx: las
      // materias/reglas de la carrera vieja quedan cacheadas en otros hooks.
      window.location.assign('/')
    } catch {
      // El error ya queda expuesto en el contexto (`error`).
    }
  }

  if (configurandoReglas) {
    return (
      <div className="carrera-mobile">
        <button type="button" className="carrera-mobile-volver" onClick={() => setConfigurandoReglas(false)}>
          ‹ Volver
        </button>
        <h1>Tu propia carrera</h1>
        <p className="carrera-mobile-reglas-intro">
          Ponele un nombre y definí cómo se aprueba, promociona y suman los puntos.
        </p>

        <FormReglasPropias reglas={reglasDraft} onCambiar={handleCambiarReglasDraft} />

        <button
          type="button"
          className="boton-primario-mobile"
          onClick={handleConfirmarReglas}
          disabled={!reglasDraft.nombre.trim()}
        >
          {reglasDraft.nombre.trim() ? 'Continuar' : 'Ponele un nombre'}
        </button>
      </div>
    )
  }

  if (destino) {
    const esSinCarrera = destino.tipo === 'sinCarrera'
    const hayProgreso = !esPrimeraVez && tieneProgresoCargado(materias)
    const cantidadConProgreso = hayProgreso ? contarMateriasConProgreso(materias) : 0
    const puntosGanados = hayProgreso ? calcularPuntosTotales(materias, reglasCarrera) : 0
    const cargandoAccion = esPrimeraVez ? eligiendo : cambiandoCarrera

    const aviso = esPrimeraVez
      ? {
          variante: 'info',
          titulo: 'Arrancás de cero',
          cuerpo: esSinCarrera
            ? 'No vamos a clonar ningún plan de materias: las vas cargando vos a medida que las cursás.'
            : 'Vamos a armar tu plan de estudio con las materias de esta carrera.',
        }
      : hayProgreso
        ? {
            variante: 'destructivo',
            titulo: 'Vas a perder tu progreso',
            cuerpo: 'Las notas y los puntos que cargaste en tu carrera actual se borran. Esto no se puede deshacer.',
          }
        : {
            variante: 'info',
            titulo: 'No hay nada que perder',
            cuerpo: 'Todavía no cargaste notas ni puntos, así que el cambio no borra nada.',
          }

    const nombreDestino = esSinCarrera ? destino.reglas.nombre : destino.carrera.nombre
    const titulo = esPrimeraVez ? `¿Elegir "${nombreDestino}"?` : `¿Cambiar a "${nombreDestino}"?`
    const labelConfirmar = esPrimeraVez ? 'Sí, elegir esta carrera' : 'Sí, cambiar de carrera'

    return (
      <div className="carrera-mobile">
        <div className="carrera-mobile-titulo-bloque">
          <h1>{titulo}</h1>
          {!esSinCarrera && <p className="carrera-mobile-universidad">{destino.carrera.universidad}</p>}
        </div>

        <div className={`carrera-mobile-aviso ${aviso.variante}`}>
          <h3>{aviso.titulo}</h3>
          <p>{aviso.cuerpo}</p>
        </div>

        {hayProgreso && (
          <div className="carrera-mobile-borra">
            <span className="seccion-mobile-label">Lo que se borra</span>
            <div className="carrera-mobile-borra-fila">
              <span>Materias con notas cargadas</span>
              <span className="carrera-mobile-borra-valor">{cantidadConProgreso}</span>
            </div>
            <div className="carrera-mobile-borra-fila">
              <span>Puntos ganados</span>
              <span className="carrera-mobile-borra-valor">{puntosGanados}</span>
            </div>
          </div>
        )}

        <button
          type="button"
          className={hayProgreso ? 'carrera-mobile-confirmar destructivo' : 'carrera-mobile-confirmar'}
          onClick={handleConfirmar}
          disabled={cargandoAccion}
        >
          {cargandoAccion ? 'Un momento…' : labelConfirmar}
        </button>
        <button
          type="button"
          className="carrera-mobile-cancelar"
          onClick={() => setDestino(null)}
          disabled={cargandoAccion}
        >
          Cancelar
        </button>

        {error && <p className="carrera-mobile-error">{error}</p>}
      </div>
    )
  }

  return (
    <div className="carrera-mobile">
      {esPrimeraVez ? (
        <button type="button" className="carrera-mobile-volver" onClick={cerrarSesion}>
          ‹ Volver al registro
        </button>
      ) : (
        <Link to="/" className="carrera-mobile-volver">
          ‹ Materias
        </Link>
      )}

      <h1>{esPrimeraVez ? '¿Qué carrera estás cursando?' : 'Cambiar de carrera'}</h1>

      {carreraActual && (
        <div className="carrera-mobile-actual">
          <span className="carrera-mobile-actual-label">Tu carrera actual</span>
          <span className="carrera-mobile-actual-nombre">{carreraActual.nombre}</span>
          <span className="carrera-mobile-actual-meta">
            {carreraActual.universidad} · {materias.length} materias
          </span>
        </div>
      )}

      {actualmenteSinCarrera && (
        <div className="carrera-mobile-actual">
          <span className="carrera-mobile-actual-label">Tu carrera actual</span>
          <span className="carrera-mobile-actual-nombre">{perfil?.nombre_custom}</span>
          <span className="carrera-mobile-actual-meta">{materias.length} materias cargadas a mano</span>
        </div>
      )}

      <input
        type="search"
        className="carrera-mobile-buscador"
        placeholder="Buscar universidad o carrera"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <button type="button" className="carrera-mobile-sin-carrera" onClick={handleAbrirReglas}>
        <span className="material-symbols-outlined carrera-mobile-sin-carrera-icono" aria-hidden="true">
          edit_note
        </span>
        <span className="carrera-mobile-sin-carrera-texto">
          <span className="carrera-mobile-sin-carrera-nombre">Crear una carrera propia</span>
          <span className="carrera-mobile-sin-carrera-ayuda">Vos definís cómo se aprueba, promociona y puntúa</span>
        </span>
      </button>

      {cargandoLista ? (
        <p className="page-placeholder">Cargando carreras…</p>
      ) : otrasCarreras.length === 0 ? (
        <p className="page-placeholder">Todavía no hay carreras cargadas.</p>
      ) : sinResultados ? (
        <p className="page-placeholder">No se encontraron carreras.</p>
      ) : (
        <div className="carrera-mobile-lista">
          {/* Universidades que matchean por su propio nombre (o todas, sin
              buscar nada): burbuja colapsable con todas sus carreras adentro
              — mismo patrón que el acordeón de año en MateriasMobile.jsx
              (details/summary sin controlar, arranca siempre cerrado). */}
          {grupos.map(([universidad, items]) => (
            <details key={universidad} className="carrera-mobile-acordeon">
              <summary className="carrera-mobile-acordeon-cabecera">
                <span className="carrera-mobile-acordeon-titulo">
                  {universidad} <span className="carrera-mobile-acordeon-conteo">({items.length})</span>
                </span>
                <span className="carrera-mobile-acordeon-chevron" aria-hidden="true">
                  ▾
                </span>
              </summary>
              <div className="carrera-mobile-grupo-lista">
                {items.map((carrera) => (
                  <button
                    key={carrera.id}
                    type="button"
                    className="carrera-mobile-opcion"
                    onClick={() => setDestino({ tipo: 'carrera', carrera })}
                  >
                    <span className="carrera-mobile-opcion-nombre">{carrera.nombre}</span>
                    <span className="material-symbols-outlined carrera-mobile-opcion-chevron" aria-hidden="true">
                      chevron_right
                    </span>
                  </button>
                ))}
              </div>
            </details>
          ))}

          {/* Carreras que matchean por su propio nombre, pero cuya
              universidad no matcheó (si no, ya están adentro de una
              burbuja de arriba) — sueltas, con la universidad al lado para
              no perder contexto fuera del acordeón. */}
          {carrerasSueltas.length > 0 && (
            <ul className="carrera-mobile-lista-plana">
              {carrerasSueltas.map((carrera) => (
                <li key={carrera.id}>
                  <button
                    type="button"
                    className="carrera-mobile-opcion"
                    onClick={() => setDestino({ tipo: 'carrera', carrera })}
                  >
                    <span className="carrera-mobile-opcion-nombre">
                      {carrera.nombre} <span className="carrera-mobile-opcion-universidad">— {carrera.universidad}</span>
                    </span>
                    <span className="material-symbols-outlined carrera-mobile-opcion-chevron" aria-hidden="true">
                      chevron_right
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default CarreraMobile
