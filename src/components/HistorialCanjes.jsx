import { useState } from 'react'

function formatearFecha(fechaIso) {
  return new Date(fechaIso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function HistorialCanjes({ canjes, onBorrarHistorial }) {
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false)

  // "Borrar historial" no elimina los canjes (eso le devolvería puntos
  // gastados al saldo, ver useCanjes.js): solo los marca `oculto`. La suma
  // de puntos y el saldo se siguen calculando sobre todos los canjes,
  // ocultos o no — acá solo se filtran para no mostrarlos.
  const visibles = canjes.filter((canje) => !canje.oculto)

  if (visibles.length === 0) {
    return <p className="page-placeholder">Todavía no canjeaste ningún premio.</p>
  }

  const canjesOrdenados = visibles.slice().sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

  return (
    <>
      <ul className="historial-lista">
        {canjesOrdenados.map((canje) => (
          <li key={canje.id} className="historial-item">
            <div className="historial-item-info">
              <span className="historial-nombre">{canje.premioNombre}</span>
              {canje.detalleOrigen?.length > 0 && (
                <span className="historial-origen">
                  de: {canje.detalleOrigen.map((o) => `${o.materiaNombre} (${o.puntos} pts)`).join(', ')}
                </span>
              )}
            </div>
            <span className="historial-fecha">{formatearFecha(canje.fecha)}</span>
            <span className="historial-costo">-{canje.costoPuntos} pts</span>
          </li>
        ))}
      </ul>

      {confirmandoBorrado ? (
        <div className="historial-borrar-confirmar">
          <span className="confirmar-texto">
            ¿Borrar todo el historial? Los puntos ya gastados no se devuelven. Esto no se puede deshacer.
          </span>
          <button
            type="button"
            className="btn-confirmar"
            onClick={() => {
              onBorrarHistorial()
              setConfirmandoBorrado(false)
            }}
          >
            Sí, borrar
          </button>
          <button type="button" onClick={() => setConfirmandoBorrado(false)}>
            Cancelar
          </button>
        </div>
      ) : (
        <button type="button" className="historial-borrar-boton" onClick={() => setConfirmandoBorrado(true)}>
          Borrar historial
        </button>
      )}
    </>
  )
}

export default HistorialCanjes
