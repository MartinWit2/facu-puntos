import { useState } from 'react'
import { Link } from 'react-router-dom'
import FormReglasPropias from '../components/FormReglasPropias.jsx'
import SelectorCarreras from '../components/SelectorCarreras.jsx'
import { usePerfil } from '../context/usePerfil.js'
import { useMaterias } from '../hooks/useMaterias.js'
import { contarMateriasConProgreso, tieneProgresoCargado } from '../utils/materiaEstructura'
import { calcularPuntosTotales } from '../utils/puntosMateria'
import './SeleccionCarrera.css'

function CambiarCarrera() {
  const {
    perfil,
    carreras,
    cargandoCarreras,
    cambiarCarrera,
    cambiarASinCarrera,
    cambiandoCarrera,
    reglasCarrera,
    error,
  } = usePerfil()
  const { materias, cargando: cargandoMaterias } = useMaterias()
  const [configurandoReglas, setConfigurandoReglas] = useState(false)
  const [destino, setDestino] = useState(null) // { tipo: 'carrera', carrera } | { tipo: 'sinCarrera', reglas } | null

  const carreraActual = carreras.find((carrera) => carrera.id === perfil?.carrera_id)
  // Si no hay carrera actual pero de todos modos ya se eligió algo (para
  // llegar a esta pantalla hace falta tener carreraElegida), la carrera
  // actual es una carrera propia, con nombre en perfil.nombre_custom.
  const actualmenteSinCarrera = !carreraActual
  const otrasCarreras = carreras.filter((carrera) => carrera.id !== perfil?.carrera_id)
  const hayProgreso = tieneProgresoCargado(materias)
  const cantidadConProgreso = hayProgreso ? contarMateriasConProgreso(materias) : 0
  const puntosGanados = hayProgreso ? calcularPuntosTotales(materias, reglasCarrera) : 0

  const handleConfirmar = async () => {
    try {
      if (destino.tipo === 'sinCarrera') await cambiarASinCarrera(destino.reglas)
      else await cambiarCarrera(destino.carrera.id)
      // Recarga completa a propósito: materias/reglas de la carrera vieja
      // quedan cacheadas en otros hooks y esta es la forma más simple de
      // asegurarse de que todo arranque de cero con la carrera nueva.
      window.location.assign('/')
    } catch {
      // El error ya queda expuesto en el contexto (`error`); no hace nada más acá.
    }
  }

  if (destino) {
    const nombreDestino = destino.tipo === 'sinCarrera' ? destino.reglas.nombre : destino.carrera.nombre
    const titulo = `¿Cambiar a "${nombreDestino}"?`

    return (
      <div className="carrera-wrapper">
        <div className="carrera-card">
          <h1>{titulo}</h1>
          {hayProgreso ? (
            <p className="carrera-aviso">
              Vas a perder las notas y el progreso que cargaste en tu carrera actual. Esto no se puede deshacer.
              ¿Confirmás el cambio?
            </p>
          ) : (
            <p className="carrera-subtitulo">
              Todavía no cargaste notas ni progreso en tu carrera actual, así que no hay nada que perder. ¿Confirmás
              el cambio?
            </p>
          )}

          {hayProgreso && (
            <ul className="carrera-lo-que-se-borra">
              <li>
                Materias con notas cargadas: <strong>{cantidadConProgreso}</strong>
              </li>
              <li>
                Puntos ganados: <strong>{puntosGanados}</strong>
              </li>
            </ul>
          )}

          <div className="carrera-cambio-acciones">
            <button type="button" onClick={handleConfirmar} disabled={cambiandoCarrera}>
              {cambiandoCarrera ? 'Cambiando…' : 'Sí, cambiar de carrera'}
            </button>
            <button type="button" onClick={() => setDestino(null)} disabled={cambiandoCarrera}>
              Cancelar
            </button>
          </div>

          {error && <p className="carrera-error">{error}</p>}
        </div>
      </div>
    )
  }

  if (configurandoReglas) {
    return (
      <div className="carrera-wrapper">
        <div className="carrera-card">
          <h1>Tu propia carrera</h1>
          <p className="carrera-subtitulo">Ponele un nombre y definí cómo se aprueba, promociona y suman los puntos.</p>

          <FormReglasPropias
            onSubmit={(reglas) => {
              setConfigurandoReglas(false)
              setDestino({ tipo: 'sinCarrera', reglas })
            }}
            onCancel={() => setConfigurandoReglas(false)}
            submitLabel="Continuar"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="carrera-wrapper">
      <div className="carrera-card">
        <h1>Cambiar de carrera</h1>
        <p className="carrera-subtitulo">
          {carreraActual ? (
            <>
              Tu carrera actual es <strong>{carreraActual.nombre}</strong> ({carreraActual.universidad}). Elegí la
              carrera nueva.
            </>
          ) : actualmenteSinCarrera ? (
            <>
              Tu carrera actual es <strong>{perfil?.nombre_custom}</strong>. Elegí la carrera nueva.
            </>
          ) : (
            'Elegí la carrera nueva.'
          )}
        </p>

        <SelectorCarreras
          carreras={otrasCarreras}
          cargando={cargandoCarreras || cargandoMaterias}
          disabled={false}
          onElegir={(carrera) => setDestino({ tipo: 'carrera', carrera })}
        />

        <button type="button" className="reglas-propias-toggle" onClick={() => setConfigurandoReglas(true)}>
          Crear una carrera propia
        </button>

        <Link to="/" className="carrera-cancelar-link">
          Cancelar
        </Link>
      </div>
    </div>
  )
}

export default CambiarCarrera
