import './HojaNota.css'

// Contenido de la hoja inferior para cargar una nota (1 a 10). Elegir una
// celda guarda y cierra de inmediato — no hay botón de confirmar, el que
// abre/cierra la hoja es quien la usa (ver MateriaDetalleMobile).
function HojaNota({ ayuda, notaAprobacion, onElegir, onBorrar }) {
  return (
    <>
      <p className="hoja-nota-ayuda">{ayuda}</p>
      <div className="hoja-nota-grilla">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((nota) => (
          <button
            key={nota}
            type="button"
            className={nota >= notaAprobacion ? 'hoja-nota-celda aprueba' : 'hoja-nota-celda'}
            onClick={() => onElegir(nota)}
          >
            {nota}
          </button>
        ))}
      </div>
      <button type="button" className="hoja-nota-borrar" onClick={onBorrar}>
        Borrar nota
      </button>
    </>
  )
}

export default HojaNota
