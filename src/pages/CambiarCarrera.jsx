import { useState } from 'react'
import { Link } from 'react-router-dom'
import SelectorCarreras from '../components/SelectorCarreras.jsx'
import { usePerfil } from '../context/usePerfil.js'
import { useMaterias } from '../hooks/useMaterias.js'
import { tieneProgresoCargado } from '../utils/materiaEstructura'
import './SeleccionCarrera.css'

function CambiarCarrera() {
  const { perfil, carreras, cargandoCarreras, cambiarCarrera, cambiandoCarrera, error } = usePerfil()
  const { materias, cargando: cargandoMaterias } = useMaterias()
  const [carreraElegida, setCarreraElegida] = useState(null)

  const carreraActual = carreras.find((carrera) => carrera.id === perfil?.carrera_id)
  const otrasCarreras = carreras.filter((carrera) => carrera.id !== perfil?.carrera_id)
  const hayProgreso = tieneProgresoCargado(materias)

  const handleConfirmar = async () => {
    try {
      await cambiarCarrera(carreraElegida.id)
      // Recarga completa a propósito: materias/reglas de la carrera vieja
      // quedan cacheadas en otros hooks y esta es la forma más simple de
      // asegurarse de que todo arranque de cero con la carrera nueva.
      window.location.assign('/')
    } catch {
      // El error ya queda expuesto en el contexto (`error`); no hace nada más acá.
    }
  }

  if (carreraElegida) {
    return (
      <div className="carrera-wrapper">
        <div className="carrera-card">
          <h1>¿Cambiar a "{carreraElegida.nombre}"?</h1>
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

          <div className="carrera-cambio-acciones">
            <button type="button" onClick={handleConfirmar} disabled={cambiandoCarrera}>
              {cambiandoCarrera ? 'Cambiando…' : 'Sí, cambiar de carrera'}
            </button>
            <button type="button" onClick={() => setCarreraElegida(null)} disabled={cambiandoCarrera}>
              Cancelar
            </button>
          </div>

          {error && <p className="carrera-error">{error}</p>}
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
          ) : (
            'Elegí la carrera nueva.'
          )}
        </p>

        <SelectorCarreras
          carreras={otrasCarreras}
          cargando={cargandoCarreras || cargandoMaterias}
          disabled={false}
          onElegir={setCarreraElegida}
        />

        <Link to="/" className="carrera-cancelar-link">
          Cancelar
        </Link>
      </div>
    </div>
  )
}

export default CambiarCarrera
