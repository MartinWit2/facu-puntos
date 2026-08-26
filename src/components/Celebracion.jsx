import { useCallback, useState } from 'react'
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

// Festejo cortito (confetti cayendo ~1.5s) para el momento en que una
// materia promociona/firma o se confirma un canje. `celebrar()` lo dispara;
// `elemento` es el overlay a renderizar en el árbol del componente que lo usa.
export function useCelebracion() {
  const [piezas, setPiezas] = useState(null)

  const celebrar = useCallback(() => {
    setPiezas(generarPiezas())
    setTimeout(() => setPiezas(null), DURACION_MS)
  }, [])

  const elemento = piezas ? (
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
  ) : null

  return { celebrar, elemento }
}
