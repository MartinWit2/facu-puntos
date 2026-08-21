import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'facu_puntos.premios'

function crearPremiosEjemplo() {
  return [
    { id: crypto.randomUUID(), nombre: 'Salir a comer afuera', categoria: 'Comida', costoPuntos: 80 },
    { id: crypto.randomUUID(), nombre: 'Pedir delivery de algo rico', categoria: 'Comida', costoPuntos: 40 },
    { id: crypto.randomUUID(), nombre: 'Maratón de una serie', categoria: 'Ocio', costoPuntos: 60 },
    { id: crypto.randomUUID(), nombre: 'Noche de juegos o salida con amigos', categoria: 'Ocio', costoPuntos: 90 },
    { id: crypto.randomUUID(), nombre: 'Comprarme algo que quiero hace tiempo', categoria: 'Compras', costoPuntos: 150 },
    { id: crypto.randomUUID(), nombre: 'Día libre sin culpa', categoria: 'Descanso', costoPuntos: 100 },
  ]
}

function cargarPremios() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    // raw === null significa que nunca se guardó nada todavía (primer uso):
    // ahí sembramos los ejemplos. Un array vacío guardado a propósito (el
    // usuario borró todo) se respeta tal cual, sin volver a sembrar.
    if (raw === null) return crearPremiosEjemplo()
    return JSON.parse(raw)
  } catch {
    return crearPremiosEjemplo()
  }
}

export function usePremios() {
  const [premios, setPremios] = useState(cargarPremios)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(premios))
  }, [premios])

  const agregarPremio = useCallback((datos) => {
    const nuevo = { id: crypto.randomUUID(), ...datos }
    setPremios((prev) => [...prev, nuevo])
  }, [])

  const editarPremio = useCallback((id, datos) => {
    setPremios((prev) => prev.map((premio) => (premio.id === id ? { ...premio, ...datos } : premio)))
  }, [])

  const eliminarPremio = useCallback((id) => {
    setPremios((prev) => prev.filter((premio) => premio.id !== id))
  }, [])

  return { premios, agregarPremio, editarPremio, eliminarPremio }
}
