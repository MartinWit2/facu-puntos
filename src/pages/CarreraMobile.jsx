import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import { usePerfil } from '../context/usePerfil.js'
import { useMaterias } from '../hooks/useMaterias.js'
import { contarMateriasConProgreso, tieneProgresoCargado } from '../utils/materiaEstructura'
import { calcularPuntosTotales } from '../utils/puntosMateria'
import './CarreraMobile.css'

// Mismo criterio de matching que SelectorCarreras.jsx (coincide): substring
// case-insensitive por nombre o universidad. Se repite acá porque este
// componente además agrupa por universidad, cosa que SelectorCarreras no
// hace y no vale la pena tocar solo para mobile.
function coincide(carrera, busqueda) {
  const q = busqueda.trim().toLowerCase()
  if (!q) return true
  return carrera.nombre.toLowerCase().includes(q) || carrera.universidad?.toLowerCase().includes(q)
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

// Cubre los dos casos del repo (SeleccionCarrera de primera vez y
// CambiarCarrera) en un solo componente de dos pasos: el modo se deriva de
// `carreraElegida` de usePerfil(), no de una prop — así, renderizado sin
// chrome antes de elegir carrera (App.jsx) es "primera vez", y renderizado
// dentro del layout normal en /cambiar-carrera es "cambio".
function CarreraMobile() {
  const { cerrarSesion } = useAuth()
  const {
    perfil,
    carreras,
    cargandoCarreras,
    carreraElegida,
    elegirCarrera,
    eligiendo,
    cambiarCarrera,
    cambiandoCarrera,
    reglasCarrera,
    error,
  } = usePerfil()
  const { materias, cargando: cargandoMaterias } = useMaterias()
  const [busqueda, setBusqueda] = useState('')
  const [carreraAConfirmar, setCarreraAConfirmar] = useState(null)

  const esPrimeraVez = !carreraElegida
  const carreraActual = carreras.find((c) => c.id === perfil?.carrera_id)
  const otrasCarreras = carreraActual ? carreras.filter((c) => c.id !== carreraActual.id) : carreras
  const filtradas = otrasCarreras.filter((c) => coincide(c, busqueda))
  const grupos = agruparPorUniversidad(filtradas)
  const cargandoLista = cargandoCarreras || cargandoMaterias

  const handleConfirmar = async () => {
    if (esPrimeraVez) {
      // A diferencia de cambiarCarrera, elegirCarrera no necesita recarga
      // completa: no hay materias/reglas de una carrera vieja cacheadas en
      // otros hooks para limpiar, porque todavía no había ninguna.
      await elegirCarrera(carreraAConfirmar.id)
      return
    }
    try {
      await cambiarCarrera(carreraAConfirmar.id)
      // Recarga completa a propósito, igual que CambiarCarrera.jsx: las
      // materias/reglas de la carrera vieja quedan cacheadas en otros hooks.
      window.location.assign('/')
    } catch {
      // El error ya queda expuesto en el contexto (`error`).
    }
  }

  if (carreraAConfirmar) {
    const hayProgreso = !esPrimeraVez && tieneProgresoCargado(materias)
    const cantidadConProgreso = hayProgreso ? contarMateriasConProgreso(materias) : 0
    const puntosGanados = hayProgreso ? calcularPuntosTotales(materias, reglasCarrera) : 0
    const cargandoAccion = esPrimeraVez ? eligiendo : cambiandoCarrera

    const aviso = esPrimeraVez
      ? {
          variante: 'info',
          titulo: 'Arrancás de cero',
          cuerpo: 'Vamos a armar tu plan de estudio con las materias de esta carrera.',
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

    return (
      <div className="carrera-mobile">
        <div className="carrera-mobile-titulo-bloque">
          <h1>
            {esPrimeraVez ? `¿Elegir "${carreraAConfirmar.nombre}"?` : `¿Cambiar a "${carreraAConfirmar.nombre}"?`}
          </h1>
          <p className="carrera-mobile-universidad">{carreraAConfirmar.universidad}</p>
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
          {cargandoAccion ? 'Un momento…' : esPrimeraVez ? 'Sí, elegir esta carrera' : 'Sí, cambiar de carrera'}
        </button>
        <button
          type="button"
          className="carrera-mobile-cancelar"
          onClick={() => setCarreraAConfirmar(null)}
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

      <input
        type="search"
        className="carrera-mobile-buscador"
        placeholder="Buscar universidad o carrera"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {cargandoLista ? (
        <p className="page-placeholder">Cargando carreras…</p>
      ) : otrasCarreras.length === 0 ? (
        <p className="page-placeholder">Todavía no hay carreras cargadas.</p>
      ) : grupos.length === 0 ? (
        <p className="page-placeholder">Ninguna carrera coincide con "{busqueda}".</p>
      ) : (
        <div className="carrera-mobile-lista">
          {grupos.map(([universidad, items]) => (
            <div key={universidad} className="carrera-mobile-grupo">
              <span className="seccion-mobile-label">{universidad}</span>
              {items.map((carrera) => (
                <button
                  key={carrera.id}
                  type="button"
                  className="carrera-mobile-opcion"
                  onClick={() => setCarreraAConfirmar(carrera)}
                >
                  <span className="carrera-mobile-opcion-nombre">{carrera.nombre}</span>
                  <span className="carrera-mobile-opcion-chevron" aria-hidden="true">
                    ›
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CarreraMobile
