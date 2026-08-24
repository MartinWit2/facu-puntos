import { usePerfil } from '../context/usePerfil.js'
import './SeleccionCarrera.css'

function SeleccionCarrera() {
  const { carreras, cargandoCarreras, elegirCarrera, eligiendo, error } = usePerfil()

  return (
    <div className="carrera-wrapper">
      <div className="carrera-card">
        <h1>¿Qué carrera estás cursando?</h1>
        <p className="carrera-subtitulo">Elegí tu carrera para armar tu plan de estudio automáticamente.</p>

        {cargandoCarreras ? (
          <p className="carrera-estado">Cargando carreras…</p>
        ) : carreras.length === 0 ? (
          <p className="carrera-estado">Todavía no hay carreras cargadas en el sistema.</p>
        ) : (
          <ul className="carrera-lista">
            {carreras.map((carrera) => (
              <li key={carrera.id}>
                <button type="button" disabled={eligiendo} onClick={() => elegirCarrera(carrera.id)}>
                  {carrera.nombre}
                </button>
              </li>
            ))}
          </ul>
        )}

        {eligiendo && <p className="carrera-estado">Armando tu plan de estudio…</p>}
        {error && <p className="carrera-error">{error}</p>}
      </div>
    </div>
  )
}

export default SeleccionCarrera
