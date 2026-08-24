import { RANGO_HORAS_UMBRAL_1, RANGO_HORAS_UMBRAL_2 } from '../constants'
import { evaluarCursada } from './cursada'

export const FILTROS_VACIOS = { anios: [], rangosHoras: [], estados: [] }

export const RANGOS_HORAS = [
  { valor: 'bajo', etiqueta: `0-${RANGO_HORAS_UMBRAL_1 - 1}` },
  { valor: 'medio', etiqueta: `${RANGO_HORAS_UMBRAL_1}-${RANGO_HORAS_UMBRAL_2 - 1}` },
  { valor: 'alto', etiqueta: `+${RANGO_HORAS_UMBRAL_2}` },
]

export function calcularRangoHoras(horasCatedra) {
  if (horasCatedra >= RANGO_HORAS_UMBRAL_2) return 'alto'
  if (horasCatedra >= RANGO_HORAS_UMBRAL_1) return 'medio'
  return 'bajo'
}

// El filtro de estado agrupa los 5 estados reales en 4 opciones: "Aprobada"
// incluye tanto promoción como aprobación por final (ambas son la materia
// terminada, solo por caminos distintos), y "Recursa" no tiene opción propia:
// cuenta como "Pendiente".
const ESTADOS_POR_FILTRO = {
  aprobada: ['aprobada', 'promocion'],
  firmada: ['firma'],
  cursando: ['cursando'],
  pendiente: ['recursa'],
}

// Dentro de cada categoría los valores seleccionados combinan por OR (ej.
// "1er año" o "2do año"); entre categorías combinan por AND (ej. año Y estado).
export function materiaCoincideFiltros(materia, filtros) {
  if (filtros.anios.length > 0 && !filtros.anios.includes(String(materia.anioCursada))) return false

  if (filtros.rangosHoras.length > 0 && !filtros.rangosHoras.includes(calcularRangoHoras(materia.horasCatedra))) {
    return false
  }

  if (filtros.estados.length > 0) {
    const estado = evaluarCursada(materia).estado
    const coincide = filtros.estados.some((filtroEstado) => ESTADOS_POR_FILTRO[filtroEstado].includes(estado))
    if (!coincide) return false
  }

  return true
}
