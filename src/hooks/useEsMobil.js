import { useEffect, useState } from 'react'

// Mismo corte que ya usaba la nav de escritorio para pasar a modo mobile
// (ver App.css, "@media (max-width: 640px)"), ahora centralizado acá para
// que el chrome entero (header, tabs) y las pantallas puedan decidir con el
// mismo criterio qué versión renderizar.
const CONSULTA = '(max-width: 640px)'

export function useEsMobil() {
  const [esMobil, setEsMobil] = useState(() => window.matchMedia(CONSULTA).matches)

  useEffect(() => {
    const media = window.matchMedia(CONSULTA)
    // El evento "change" de matchMedia no siempre se dispara con algunas
    // formas de redimensionar (ej. las herramientas de emulación de
    // viewport de las devtools); "resize" es más confiable como respaldo,
    // así que se escuchan los dos y siempre se relee `media.matches` fresco.
    const actualizar = () => setEsMobil(media.matches)
    media.addEventListener('change', actualizar)
    window.addEventListener('resize', actualizar)
    return () => {
      media.removeEventListener('change', actualizar)
      window.removeEventListener('resize', actualizar)
    }
  }, [])

  return esMobil
}
