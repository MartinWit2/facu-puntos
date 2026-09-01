import { RANGO_HORAS_UMBRAL_1, RANGO_HORAS_UMBRAL_2 } from '../constants'
import { evaluarCursada } from './cursada'
import { calcularReglasEfectivas } from './reglasMateria'

// `rangosHoras` (3 categorías fijas) es el filtro de horas que sigue usando
// el desktop sin cambios (MateriaFiltros.jsx, que hace
// Object.values(filtros).some(lista => lista.length > 0) — por eso
// `horasMax` NO puede vivir adentro de este objeto, rompería esa cuenta
// con un null sin .length). El filtro nuevo del rediseño mobile (sección
// "3c" del handoff, un slider continuo de "hasta X horas") se pasa aparte,
// como cuarto argumento de materiaCoincideFiltros.
export const FILTROS_VACIOS = { anios: [], rangosHoras: [], estados: [] }

// Tope del slider de horas — mismo máximo que ya usan los steppers de
// horas cátedra (RANGOS.horasCatedra.max en MateriaForm/HojaNuevaMateria/
// HojaEditarMateria), así el filtro nunca deja afuera un valor cargable.
export const HORAS_CATEDRA_MAX = 320

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

// El filtro de estado agrupa los 6 estados reales en 4 opciones: "Aprobada"
// incluye tanto promoción como aprobación por final (ambas son la materia
// terminada, solo por caminos distintos), y "Pendiente" agrupa tanto las
// materias sin empezar como las que recursan (en ambos casos, sin cursada
// vigente en curso).
const ESTADOS_POR_FILTRO = {
  aprobada: ['aprobada', 'promocion'],
  firmada: ['firma'],
  cursando: ['cursando'],
  pendiente: ['recursa', 'pendiente'],
}

// Dentro de cada categoría los valores seleccionados combinan por OR (ej.
// "1er año" o "2do año"); entre categorías combinan por AND (ej. año Y estado).
export function materiaCoincideFiltros(materia, filtros, reglasCarrera, horasMax) {
  if (filtros.anios.length > 0 && !filtros.anios.includes(String(materia.anioCursada))) return false

  if (filtros.rangosHoras.length > 0 && !filtros.rangosHoras.includes(calcularRangoHoras(materia.horasCatedra))) {
    return false
  }

  // Materias sin horas cargadas no se excluyen por este filtro (no hay
  // forma de saber si están debajo o arriba del tope elegido).
  if (horasMax != null && materia.horasCatedra != null && materia.horasCatedra > horasMax) {
    return false
  }

  if (filtros.estados.length > 0) {
    const reglas = calcularReglasEfectivas(materia, reglasCarrera)
    const estado = evaluarCursada(materia, reglas).estado
    const coincide = filtros.estados.some((filtroEstado) => ESTADOS_POR_FILTRO[filtroEstado].includes(estado))
    if (!coincide) return false
  }

  return true
}
