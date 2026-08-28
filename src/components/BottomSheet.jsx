import './BottomSheet.css'

// Patrón compartido del handoff mobile: overlay + panel pegado abajo que
// entra deslizando. `footer`, si se pasa, queda fijo al pie (no scrollea
// con el cuerpo) — lo usa la hoja de editar materia para su botón "Listo".
// `altoMax` (en vh) permite hojas más altas que el default, como esa misma.
function BottomSheet({ abierto, onCerrar, titulo, footer, altoMax = 80, children }) {
  if (!abierto) return null

  return (
    <div className="bottom-sheet-overlay" onClick={onCerrar}>
      <div className="bottom-sheet" style={{ maxHeight: `${altoMax}vh` }} onClick={(e) => e.stopPropagation()}>
        <div className="bottom-sheet-cabecera">
          {titulo && <h3 className="bottom-sheet-titulo">{titulo}</h3>}
          <button type="button" className="bottom-sheet-cerrar" onClick={onCerrar}>
            Cerrar
          </button>
        </div>
        <div className="bottom-sheet-cuerpo">{children}</div>
        {footer && <div className="bottom-sheet-pie">{footer}</div>}
      </div>
    </div>
  )
}

export default BottomSheet
