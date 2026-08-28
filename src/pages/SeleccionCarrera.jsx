import { useState } from 'react'
import FormReglasPropias from '../components/FormReglasPropias.jsx'
import SelectorCarreras from '../components/SelectorCarreras.jsx'
import { usePerfil } from '../context/usePerfil.js'
import './SeleccionCarrera.css'

function SeleccionCarrera() {
  const { carreras, cargandoCarreras, elegirCarrera, elegirSinCarrera, eligiendo, error } = usePerfil()
  const [sinCarrera, setSinCarrera] = useState(false)

  if (sinCarrera) {
    return (
      <div className="carrera-wrapper">
        <div className="carrera-card">
          <h1>Tu propia carrera</h1>
          <p className="carrera-subtitulo">Ponele un nombre y definí cómo se aprueba, promociona y suman los puntos.</p>

          <FormReglasPropias
            onSubmit={elegirSinCarrera}
            onCancel={() => setSinCarrera(false)}
            submitLabel="Empezar"
            disabled={eligiendo}
          />

          {eligiendo && <p className="carrera-estado">Un momento…</p>}
          {error && <p className="carrera-error">{error}</p>}
        </div>
      </div>
    )
  }

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

        <button type="button" className="reglas-propias-toggle" onClick={() => setSinCarrera(true)}>
          Crear una carrera propia
        </button>

        {eligiendo && <p className="carrera-estado">Armando tu plan de estudio…</p>}
        {error && <p className="carrera-error">{error}</p>}
      </div>
    </div>
  )
}

export default SeleccionCarrera
