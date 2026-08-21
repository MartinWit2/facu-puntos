function formatearFecha(fechaIso) {
  return new Date(fechaIso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function HistorialCanjes({ canjes }) {
  if (canjes.length === 0) {
    return <p className="page-placeholder">Todavía no canjeaste ningún premio.</p>
  }

  const canjesOrdenados = canjes.slice().sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

  return (
    <ul className="historial-lista">
      {canjesOrdenados.map((canje) => (
        <li key={canje.id} className="historial-item">
          <span className="historial-nombre">{canje.premioNombre}</span>
          <span className="historial-fecha">{formatearFecha(canje.fecha)}</span>
          <span className="historial-costo">-{canje.costoPuntos} pts</span>
        </li>
      ))}
    </ul>
  )
}

export default HistorialCanjes
