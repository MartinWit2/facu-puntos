import './BottomSheet.css'

// Patrón compartido del handoff mobile: overlay + panel pegado abajo que
// entra deslizando. Se usa para los filtros (por ahora) y, en las próximas
// pantallas, para cargar notas y elegir el origen de un canje.
function BottomSheet({ abierto, onCerrar, titulo, children }) {
  if (!abierto) return null

  return (
    <div className="bottom-sheet-overlay" onClick={onCerrar}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="bottom-sheet-cabecera">
          {titulo && <h3 className="bottom-sheet-titulo">{titulo}</h3>}
          <button type="button" className="bottom-sheet-cerrar" onClick={onCerrar}>
            Cerrar
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default BottomSheet
