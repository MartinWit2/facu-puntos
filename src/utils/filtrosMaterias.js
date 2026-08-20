import { NIVEL_UMBRAL_1_2, NIVEL_UMBRAL_2_3 } from '../constants'
import { evaluarCursada } from './cursada'
import { calcularNivelMateria } from './niveles'

export const FILTROS_VACIOS = { anios: [], rangosHoras: [], niveles: [], estados: [] }

// Mismos cortes que los niveles: se reutilizan para no tener dos escalas
// distintas conviviendo en la pantalla.
export const RANGOS_HORAS = [
  { valor: 'bajo', etiqueta: `0-${NIVEL_UMBRAL_1_2 - 1}` },
  { valor: 'medio', etiqueta: `${NIVEL_UMBRAL_1_2}-${NIVEL_UMBRAL_2_3 - 1}` },
  { valor: 'alto', etiqueta: `+${NIVEL_UMBRAL_2_3}` },
]

export function calcularRangoHoras(horasCatedra) {
  if (horasCatedra >= NIVEL_UMBRAL_2_3) return 'alto'
  if (horasCatedra >= NIVEL_UMBRAL_1_2) return 'medio'
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
// "1er año" o "2do año"); entre categorías combinan por AND (ej. año Y nivel).
export function materiaCoincideFiltros(materia, filtros) {
  if (filtros.anios.length > 0 && !filtros.anios.includes(String(materia.anioCursada))) return false

  if (filtros.rangosHoras.length > 0 && !filtros.rangosHoras.includes(calcularRangoHoras(materia.horasCatedra))) {
    return false
  }

  if (filtros.niveles.length > 0 && !filtros.niveles.includes(String(calcularNivelMateria(materia)))) return false

  if (filtros.estados.length > 0) {
    const estado = evaluarCursada(materia).estado
    const coincide = filtros.estados.some((filtroEstado) => ESTADOS_POR_FILTRO[filtroEstado].includes(estado))
    if (!coincide) return false
  }

  return true
}
