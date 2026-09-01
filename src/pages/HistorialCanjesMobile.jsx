import { useState } from 'react'
import { Link } from 'react-router-dom'
import BottomSheet from '../components/BottomSheet.jsx'
import { useCanjes } from '../hooks/useCanjes.js'
import './HistorialCanjesMobile.css'

function formatearFecha(fechaIso) {
  return new Date(fechaIso).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Pantalla propia (sección "3a" del rediseño mobile): antes era un
// acordeón embebido en PremiosMobile.jsx, ahora es su propia ruta
// (/historial-canjes) a la que se llega con un link desde Premios. La
// lógica es la misma de siempre: "Borrar historial" solo oculta los
// canjes (oculto=true, ver useCanjes.js) sin devolver puntos gastados —
// el saldo se sigue calculando sobre todos los canjes, ocultos o no.
//
// El detalle de cada canje se ve en una hoja aparte (no como acordeón
// embebido): así la foto entra bien grande y hay lugar para todo el
// desglose de origen sin apretar la fila de la lista.
function HistorialCanjesMobile() {
  const { canjes, cargando, ocultarHistorialCanjes } = useCanjes()
  const [canjeAbiertoId, setCanjeAbiertoId] = useState(null)
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false)

  if (cargando) {
    return (
      <section className="page-mobile">
        <p className="page-placeholder">Cargando…</p>
      </section>
    )
  }

  const visibles = canjes.filter((canje) => !canje.oculto)
  const canjesOrdenados = visibles.slice().sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  const totalPuntos = canjesOrdenados.reduce((acc, canje) => acc + canje.costoPuntos, 0)
  const canjeAbierto = canjesOrdenados.find((c) => c.id === canjeAbiertoId) ?? null

  const handleBorrarHistorial = () => {
    ocultarHistorialCanjes()
    setConfirmandoBorrado(false)
    setCanjeAbiertoId(null)
  }

  return (
    <section className="page-mobile historial-mobile-pagina">
      <Link to="/premios" className="historial-mobile-volver">
        <span className="material-symbols-outlined" aria-hidden="true">
          arrow_back
        </span>
        Premios
      </Link>

      <div className="historial-mobile-encabezado">
        <h1>Historial de canjes</h1>
        {canjesOrdenados.length > 0 && (
          <span className="materias-mobile-conteo">
            {canjesOrdenados.length} canje{canjesOrdenados.length === 1 ? '' : 's'} · {totalPuntos} pts
          </span>
        )}
      </div>

      {canjesOrdenados.length === 0 ? (
        <p className="page-placeholder">Todavía no canjeaste ningún premio.</p>
      ) : (
        <div className="historial-mobile-lista">
          {canjesOrdenados.map((canje) => (
            <button
              key={canje.id}
              type="button"
              className="historial-mobile-item"
              onClick={() => setCanjeAbiertoId(canje.id)}
            >
              {canje.fotoUrl ? (
                <img src={canje.fotoUrl} alt="" className="historial-mobile-item-foto" />
              ) : (
                <span className="historial-mobile-item-foto-vacia" aria-hidden="true">
                  <span className="material-symbols-outlined">redeem</span>
                </span>
              )}
              <div className="historial-mobile-item-info">
                <span className="historial-mobile-item-nombre">{canje.premioNombre}</span>
                <span className="historial-mobile-item-fecha">{formatearFecha(canje.fecha)}</span>
              </div>
              <span className="historial-mobile-item-costo">−{canje.costoPuntos} pts</span>
              <span className="material-symbols-outlined historial-mobile-item-chevron" aria-hidden="true">
                chevron_right
              </span>
            </button>
          ))}

          {confirmandoBorrado ? (
            <div className="historial-mobile-confirmar-borrado">
              <p>¿Borrar todo el historial? Los puntos ya gastados no se devuelven. Esto no se puede deshacer.</p>
              <div className="historial-mobile-confirmar-borrado-acciones">
                <button type="button" className="historial-mobile-borrar-si" onClick={handleBorrarHistorial}>
                  Sí, borrar
                </button>
                <button type="button" onClick={() => setConfirmandoBorrado(false)}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="historial-mobile-borrar" onClick={() => setConfirmandoBorrado(true)}>
              Borrar historial
            </button>
          )}
        </div>
      )}

      <BottomSheet abierto={canjeAbierto != null} onCerrar={() => setCanjeAbiertoId(null)} titulo="Detalle del canje" altoMax={92}>
        {canjeAbierto && (
          <div className="historial-mobile-sheet">
            {canjeAbierto.fotoUrl ? (
              <img src={canjeAbierto.fotoUrl} alt="" className="historial-mobile-sheet-foto" />
            ) : (
              <span className="historial-mobile-sheet-foto-vacia" aria-hidden="true">
                <span className="material-symbols-outlined">redeem</span>
              </span>
            )}

            <h2 className="historial-mobile-sheet-nombre">{canjeAbierto.premioNombre}</h2>
            <p className="historial-mobile-sheet-fecha">{formatearFecha(canjeAbierto.fecha)}</p>
            <p className="historial-mobile-sheet-costo">−{canjeAbierto.costoPuntos} pts</p>

            <div className="historial-mobile-sheet-origen">
              <span className="historial-mobile-detalle-label">De dónde salieron</span>
              {(canjeAbierto.detalleOrigen ?? []).map((origen, indice) => (
                <div key={indice} className="historial-mobile-detalle-fila">
                  <span>{origen.materiaNombre}</span>
                  <span className="historial-mobile-detalle-puntos">{origen.puntos} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </BottomSheet>
    </section>
  )
}

export default HistorialCanjesMobile
