import { useCallback, useEffect, useState } from 'react'
import { ajustarEstructuraNotas, crearEstructuraNotas } from '../utils/materiaEstructura'

const STORAGE_KEY = 'facu_puntos.materias'

function cargarMaterias() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useMaterias() {
  const [materias, setMaterias] = useState(cargarMaterias)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(materias))
  }, [materias])

  const agregarMateria = useCallback((datos) => {
    const nueva = { id: crypto.randomUUID(), ...datos, ...crearEstructuraNotas(datos) }
    setMaterias((prev) => [...prev, nueva])
  }, [])

  const editarMateria = useCallback((id, datos) => {
    setMaterias((prev) =>
      prev.map((materia) => {
        if (materia.id !== id) return materia

        const cambiaEstructura =
          datos.cantidadParciales !== undefined ||
          datos.cantidadRecuperatorios !== undefined ||
          datos.cantidadInstanciasFinal !== undefined

        return {
          ...materia,
          ...datos,
          ...(cambiaEstructura ? ajustarEstructuraNotas(materia, datos) : null),
        }
      }),
    )
  }, [])

  const eliminarMateria = useCallback((id) => {
    setMaterias((prev) => prev.filter((materia) => materia.id !== id))
  }, [])

  return { materias, agregarMateria, editarMateria, eliminarMateria }
}
