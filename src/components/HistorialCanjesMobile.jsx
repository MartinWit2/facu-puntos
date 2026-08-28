import { useState } from 'react'
import './HistorialCanjesMobile.css'

function formatearFecha(fechaIso) {
  return new Date(fechaIso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Acordeón de dos niveles (sección "4. Premios" del handoff v3): la cabecera
// colapsa/expande toda la lista, y cada canje colapsa/expande su propio
// detalle de origen (uno solo a la vez). El dato de origen ya viene guardado
// en `canje.detalleOrigen` como una "foto" al momento del canje — no hace
// falta manejar el caso de una materia borrada, el nombre que se guardó ahí
// es el que se muestra siempre.
function HistorialCanjesMobile({ canjes }) {
  const [abierto, setAbierto] = useState(false)
  const [canjeAbiertoId, setCanjeAbiertoId] = useState(null)

  if (canjes.length === 0) {
    return <p className="page-placeholder">Todavía no canjeaste ningún premio.</p>
  }

  const canjesOrdenados = canjes.slice().sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  const totalPuntos = canjesOrdenados.reduce((acc, canje) => acc + canje.costoPuntos, 0)
  const resumen = `${canjesOrdenados.length} canje${canjesOrdenados.length === 1 ? '' : 's'} · ${totalPuntos} pts`

  const toggleAbierto = () => {
    setAbierto((prev) => {
      const next = !prev
      if (!next) setCanjeAbiertoId(null)
      return next
    })
  }

  return (
    <div className="historial-mobile">
      <button type="button" className="historial-mobile-cabecera" onClick={toggleAbierto}>
        <span className="historial-mobile-titulo">Historial</span>
        <span className="historial-mobile-resumen">{resumen}</span>
        <span className={abierto ? 'historial-mobile-chevron abierto' : 'historial-mobile-chevron'} aria-hidden="true">
          ▾
        </span>
      </button>

      {abierto && (
        <div className="historial-mobile-lista">
          {canjesOrdenados.map((canje) => {
            const expandido = canjeAbiertoId === canje.id
            return (
              <div key={canje.id} className="historial-mobile-item">
                <button
                  type="button"
                  className="historial-mobile-item-cabecera"
                  onClick={() => setCanjeAbiertoId(expandido ? null : canje.id)}
                >
                  <div className="historial-mobile-item-info">
                    <span className="historial-mobile-item-nombre">{canje.premioNombre}</span>
                    <span className="historial-mobile-item-fecha">{formatearFecha(canje.fecha)}</span>
                  </div>
                  <span className="historial-mobile-item-costo">−{canje.costoPuntos} pts</span>
                  <span
                    className={expandido ? 'historial-mobile-item-chevron abierto' : 'historial-mobile-item-chevron'}
                    aria-hidden="true"
                  >
                    ▾
                  </span>
                </button>

                {expandido && (
                  <div className="historial-mobile-detalle">
                    <span className="historial-mobile-detalle-label">De dónde salieron</span>
                    {(canje.detalleOrigen ?? []).map((origen, indice) => (
                      <div key={indice} className="historial-mobile-detalle-fila">
                        <span>{origen.materiaNombre}</span>
                        <span className="historial-mobile-detalle-puntos">{origen.puntos} pts</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default HistorialCanjesMobile
