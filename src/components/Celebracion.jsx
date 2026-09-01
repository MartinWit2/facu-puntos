import { useCallback, useState } from 'react'
import { reproducirSonido } from '../utils/sonidos'
import './Celebracion.css'

const COLORES = ['#58cc02', '#1cb0f6', '#ffc800', '#ff4b4b', '#ce82ff']
const CANTIDAD_PIEZAS = 28
const DURACION_MS = 1500

function generarPiezas() {
  return Array.from({ length: CANTIDAD_PIEZAS }, (_, i) => ({
    id: i,
    izquierda: Math.random() * 100,
    color: COLORES[Math.floor(Math.random() * COLORES.length)],
    demora: Math.random() * 0.3,
    duracion: 1 + Math.random() * 0.6,
    rotacion: Math.round(Math.random() * 360),
  }))
}

// Festejo (confetti cayendo ~1.5s + una card centrada + un sonido cortito)
// para el momento en que una materia promociona/firma, o se confirma un
// canje de premio — mismo lenguaje visual para las dos, solo cambia el
// contenido de la card (sección "3i" del rediseño) y el sonido (sección
// "2" del prompt de notificaciones). `celebrar(variante, contenido)`:
// `variante` es 'materia' o 'premio' (elige qué sonido suena — default
// 'materia' si no se pasa nada, para no romper un `celebrar()` viejo sin
// argumentos); `contenido` ({ icono, titulo, subtitulo, boton }) es
// opcional, si se pasa además muestra la card hasta que se toque el botón
// o se cierre. `elemento` es lo que hay que renderizar en el árbol del
// componente que lo usa.
export function useCelebracion() {
  const [piezas, setPiezas] = useState(null)
  const [contenido, setContenido] = useState(null)

  const celebrar = useCallback((variante, contenidoCard) => {
    setPiezas(generarPiezas())
    setTimeout(() => setPiezas(null), DURACION_MS)
    reproducirSonido(variante)
    if (contenidoCard) setContenido(contenidoCard)
  }, [])

  const cerrarContenido = useCallback(() => setContenido(null), [])

  const elemento = (
    <>
      {piezas && (
        <div className="celebracion-overlay" aria-hidden="true">
          {piezas.map((pieza) => (
            <span
              key={pieza.id}
              className="celebracion-pieza"
              style={{
                left: `${pieza.izquierda}%`,
                backgroundColor: pieza.color,
                animationDelay: `${pieza.demora}s`,
                animationDuration: `${pieza.duracion}s`,
                transform: `rotate(${pieza.rotacion}deg)`,
              }}
            />
          ))}
        </div>
      )}

      {contenido && (
        <div className="celebracion-modal-overlay" onClick={cerrarContenido}>
          <div className="celebracion-modal" onClick={(e) => e.stopPropagation()}>
            <span className="celebracion-modal-icono" aria-hidden="true">
              <span className="material-symbols-outlined relleno">{contenido.icono}</span>
            </span>
            <h3 className="celebracion-modal-titulo">{contenido.titulo}</h3>
            {contenido.subtitulo && <p className="celebracion-modal-subtitulo">{contenido.subtitulo}</p>}
            <button type="button" className="boton-primario-mobile" onClick={cerrarContenido}>
              {contenido.boton}
            </button>
          </div>
        </div>
      )}
    </>
  )

  return { celebrar, elemento }
}
