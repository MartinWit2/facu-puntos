import { useState } from 'react'

// Reparte el costo del premio entre las materias tildadas, en el orden en
// que se tildaron: agota la primera, si no alcanza sigue con la segunda, etc.
function calcularDetalleOrigen(seleccion, origenesDisponibles, costoPuntos) {
  let restante = costoPuntos
  const detalle = []

  for (const materiaId of seleccion) {
    if (restante <= 0) break
    const origen = origenesDisponibles.find((o) => o.materiaId === materiaId)
    if (!origen) continue

    const aporte = Math.min(origen.disponible, restante)
    if (aporte > 0) {
      detalle.push({ materiaId, materiaNombre: origen.nombre, puntos: Math.round(aporte * 100) / 100 })
      restante -= aporte
    }
  }

  return { detalle, restante: Math.round(restante * 100) / 100 }
}

function CanjeOrigenSelector({ premio, origenesDisponibles, onConfirmar, onCancelar }) {
  const [seleccion, setSeleccion] = useState([])

  const toggleMateria = (materiaId) => {
    setSeleccion((prev) => (prev.includes(materiaId) ? prev.filter((id) => id !== materiaId) : [...prev, materiaId]))
  }

  const { detalle, restante } = calcularDetalleOrigen(seleccion, origenesDisponibles, premio.costoPuntos)
  const alcanza = restante <= 0

  return (
    <div className="canje-origen">
      <p className="canje-origen-titulo">
        ¿De qué materia{origenesDisponibles.length === 1 ? '' : 's'} salen los {premio.costoPuntos} pts de "
        {premio.nombre}"?
      </p>

      {origenesDisponibles.length === 0 ? (
        <p className="page-placeholder">No tenés materias con puntos disponibles todavía.</p>
      ) : (
        <ul className="canje-origen-lista">
          {origenesDisponibles.map((origen) => {
            const orden = seleccion.indexOf(origen.materiaId)
            return (
              <li key={origen.materiaId} className="canje-origen-item">
                <label>
                  <input type="checkbox" checked={orden !== -1} onChange={() => toggleMateria(origen.materiaId)} />
                  {orden !== -1 && <span className="canje-origen-orden">{orden + 1}</span>}
                  {origen.nombre}
                </label>
                <span className="canje-origen-disponible">{origen.disponible} pts disponibles</span>
              </li>
            )
          })}
        </ul>
      )}

      <p className={alcanza ? 'canje-origen-resumen' : 'canje-origen-resumen canje-origen-falta'}>
        {alcanza
          ? `Cubre los ${premio.costoPuntos} pts.`
          : `Con lo tildado cubrís ${premio.costoPuntos - restante} de ${premio.costoPuntos} pts — faltan ${restante} pts.`}
      </p>

      <div className="canje-origen-acciones">
        <button type="button" className="btn-confirmar" disabled={!alcanza} onClick={() => onConfirmar(detalle)}>
          Confirmar canje
        </button>
        <button type="button" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default CanjeOrigenSelector
