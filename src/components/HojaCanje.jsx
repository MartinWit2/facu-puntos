import { useState } from 'react'
import { useAuth } from '../context/useAuth.js'
import { calcularDetalleOrigen } from '../utils/canjes'
import { subirArchivo } from '../utils/subirArchivo'
import './HojaCanje.css'

// Contenido de la hoja inferior para elegir el origen de un canje — misma
// lógica de reparto que CanjeOrigenSelector.jsx (calcularDetalleOrigen en
// utils/canjes.js), solo cambia la presentación a hoja inferior con orden
// de tildado y resumen de cobertura en vivo. La foto opcional (sección
// "4c" del rediseño) es puramente local hasta confirmar: recién se sube al
// tocar "Confirmar canje", junto con el resto del canje.
function HojaCanje({ premio, saldoDisponible, origenesDisponibles, onConfirmar }) {
  const { usuario } = useAuth()
  const [seleccion, setSeleccion] = useState([])
  const [foto, setFoto] = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [confirmando, setConfirmando] = useState(false)

  const toggleMateria = (materiaId) => {
    setSeleccion((prev) => (prev.includes(materiaId) ? prev.filter((id) => id !== materiaId) : [...prev, materiaId]))
  }

  const handleFotoChange = (e) => {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    setFoto(archivo)
    setFotoPreview(URL.createObjectURL(archivo))
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

      <div className="hoja-canje-foto-campo">
        <span className="hoja-canje-foto-label">Foto del momento (opcional)</span>
        <label className="hoja-canje-foto">
          {fotoPreview ? (
            <img src={fotoPreview} alt="" className="hoja-canje-foto-preview" />
          ) : (
            <span className="hoja-canje-foto-vacia">
              <span className="material-symbols-outlined" aria-hidden="true">
                add_a_photo
              </span>
              Agregar foto
            </span>
          )}
          <input type="file" accept="image/*" className="hoja-canje-foto-input" onChange={handleFotoChange} />
        </label>
      </div>

      <button
        type="button"
        className="hoja-canje-confirmar"
        disabled={!alcanza || confirmando}
        onClick={async () => {
          if (!foto) {
            onConfirmar(detalle, null)
            return
          }
          setConfirmando(true)
          try {
            const url = await subirArchivo('canjes-fotos', usuario.id, foto)
            onConfirmar(detalle, url)
          } catch (error) {
            console.error(error)
            onConfirmar(detalle, null)
          } finally {
            setConfirmando(false)
          }
        }}
      >
        {confirmando ? 'Subiendo foto…' : alcanza ? 'Confirmar canje' : 'Elegí de dónde salen los puntos'}
      </button>
    </>
  )
}

export default HojaCanje
