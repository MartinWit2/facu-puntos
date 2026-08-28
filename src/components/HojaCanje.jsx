import { useState } from 'react'
import { calcularDetalleOrigen } from '../utils/canjes'
import './HojaCanje.css'

// Contenido de la hoja inferior para elegir el origen de un canje — misma
// lógica de reparto que CanjeOrigenSelector.jsx (calcularDetalleOrigen en
// utils/canjes.js), solo cambia la presentación a hoja inferior con orden
// de tildado y resumen de cobertura en vivo.
function HojaCanje({ premio, saldoDisponible, origenesDisponibles, onConfirmar }) {
  const [seleccion, setSeleccion] = useState([])

  const toggleMateria = (materiaId) => {
    setSeleccion((prev) => (prev.includes(materiaId) ? prev.filter((id) => id !== materiaId) : [...prev, materiaId]))
  }

  const { detalle, restante } = calcularDetalleOrigen(seleccion, origenesDisponibles, premio.costoPuntos)
  const alcanza = restante <= 0
  const cubierto = Math.round((premio.costoPuntos - restante) * 100) / 100

  return (
    <>
      <p className="hoja-canje-meta">
        {premio.costoPuntos} pts · saldo {saldoDisponible}
      </p>
      <p className="hoja-canje-ayuda">Tocá las materias en el orden en que querés gastar sus puntos.</p>

      {origenesDisponibles.length === 0 ? (
        <p className="page-placeholder">No tenés materias con puntos disponibles todavía.</p>
      ) : (
        <ul className="hoja-canje-lista">
          {origenesDisponibles.map((origen) => {
            const orden = seleccion.indexOf(origen.materiaId)
            const elegida = orden !== -1
            const aportado = elegida ? (detalle.find((d) => d.materiaId === origen.materiaId)?.puntos ?? 0) : 0

            return (
              <li key={origen.materiaId}>
                <button
                  type="button"
                  className={elegida ? 'hoja-canje-fila elegida' : 'hoja-canje-fila'}
                  onClick={() => toggleMateria(origen.materiaId)}
                >
                  <span className={elegida ? 'hoja-canje-orden lleno' : 'hoja-canje-orden'} aria-hidden="true">
                    {elegida ? orden + 1 : ''}
                  </span>
                  <span className="hoja-canje-nombre">{origen.nombre}</span>
                  <span className="hoja-canje-disp">
                    {elegida ? `${aportado} de ${premio.costoPuntos}` : `${origen.disponible} disp.`}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <p className={alcanza ? 'hoja-canje-resumen ok' : 'hoja-canje-resumen falta'}>
        {alcanza
          ? `Cubierto: ${premio.costoPuntos} de ${premio.costoPuntos} pts`
          : `Cubierto ${cubierto} de ${premio.costoPuntos} pts · faltan ${restante}`}
      </p>

      <button type="button" className="hoja-canje-confirmar" disabled={!alcanza} onClick={() => onConfirmar(detalle)}>
        {alcanza ? 'Confirmar canje' : 'Elegí de dónde salen los puntos'}
      </button>
    </>
  )
}

export default HojaCanje
