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
    const escuchar = (e) => setEsMobil(e.matches)
    media.addEventListener('change', escuchar)
    return () => media.removeEventListener('change', escuchar)
  }, [])

  return esMobil
}
