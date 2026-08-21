import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'facu_puntos.canjes'

function cargarCanjes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useCanjes() {
  const [canjes, setCanjes] = useState(cargarCanjes)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(canjes))
  }, [canjes])

  // Se guarda una "foto" del nombre y costo del premio en ese momento: un
  // canje ya hecho no se revierte ni cambia aunque el premio se edite o
  // se borre después.
  const agregarCanje = useCallback((premio) => {
    const nuevo = {
      id: crypto.randomUUID(),
      premioId: premio.id,
      premioNombre: premio.nombre,
      costoPuntos: premio.costoPuntos,
      fecha: new Date().toISOString(),
    }
    setCanjes((prev) => [...prev, nuevo])
  }, [])

  return { canjes, agregarCanje }
}
