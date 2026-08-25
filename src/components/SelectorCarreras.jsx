import { useState } from 'react'

function coincide(carrera, busqueda) {
  const q = busqueda.trim().toLowerCase()
  if (!q) return true
  return carrera.nombre.toLowerCase().includes(q) || carrera.universidad?.toLowerCase().includes(q)
}

function SelectorCarreras({ carreras, cargando, disabled, onElegir }) {
  const [busqueda, setBusqueda] = useState('')

  const filtradas = carreras.filter((carrera) => coincide(carrera, busqueda))

  return (
    <div className="selector-carreras">
      <input
        type="search"
        className="selector-carreras-buscador"
        placeholder="Buscar por universidad o carrera…"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {cargando ? (
        <p className="carrera-estado">Cargando carreras…</p>
      ) : carreras.length === 0 ? (
        <p className="carrera-estado">Todavía no hay carreras cargadas en el sistema.</p>
      ) : filtradas.length === 0 ? (
        <p className="carrera-estado">Ninguna carrera coincide con "{busqueda}".</p>
      ) : (
        <ul className="carrera-lista">
          {filtradas.map((carrera) => (
            <li key={carrera.id}>
              <button type="button" disabled={disabled} onClick={() => onElegir(carrera)}>
                <span className="carrera-opcion-universidad">{carrera.universidad}</span>
                <span className="carrera-opcion-nombre">{carrera.nombre}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default SelectorCarreras
