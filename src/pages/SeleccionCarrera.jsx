import SelectorCarreras from '../components/SelectorCarreras.jsx'
import { usePerfil } from '../context/usePerfil.js'
import './SeleccionCarrera.css'

function SeleccionCarrera() {
  const { carreras, cargandoCarreras, elegirCarrera, eligiendo, error } = usePerfil()

  return (
    <div className="carrera-wrapper">
      <div className="carrera-card">
        <h1>¿Qué carrera estás cursando?</h1>
        <p className="carrera-subtitulo">Elegí tu carrera para armar tu plan de estudio automáticamente.</p>

        <SelectorCarreras
          carreras={carreras}
          cargando={cargandoCarreras}
          disabled={eligiendo}
          onElegir={(carrera) => elegirCarrera(carrera.id)}
        />

        {eligiendo && <p className="carrera-estado">Armando tu plan de estudio…</p>}
        {error && <p className="carrera-error">{error}</p>}
      </div>
    </div>
  )
}

export default SeleccionCarrera
