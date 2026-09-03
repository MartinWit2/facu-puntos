import { RANGO_HORAS_UMBRAL_1, RANGO_HORAS_UMBRAL_2 } from '../constants'
import { evaluarCursada } from './cursada'
import { calcularReglasEfectivas } from './reglasMateria'

// `rangosHoras` (3 categorías fijas) es el filtro de horas que sigue usando
// el desktop sin cambios (MateriaFiltros.jsx, que hace
// Object.values(filtros).some(lista => lista.length > 0) — por eso el
// filtro de horas de mobile NO puede vivir adentro de este objeto, rompería
// esa cuenta con un null sin .length). El filtro de mobile (un slider de
// rango real, min y max) se pasa aparte, como cuarto argumento de
// materiaCoincideFiltros.
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

// Límites del slider de rango de mobile: mínimo y máximo REALES entre las
// horas cátedra que el usuario ya cargó (no un tope fijo) — así tiene
// sentido para cualquier carrera, sin importar cuántas horas manejen sus
// materias. `null` cuando ninguna materia tiene horas cargadas todavía (no
// hay filtro que mostrar).
export function calcularLimiteHoras(materias) {
  const horas = materias.map((m) => m.horasCatedra).filter((h) => h != null)
  if (horas.length === 0) return null
  return { min: Math.min(...horas), max: Math.max(...horas) }
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
// `horas` es el rango { min, max } del slider de mobile (o null si no está
// filtrando) — independiente de `filtros.rangosHoras`, ver el comentario de
// FILTROS_VACIOS.
export function materiaCoincideFiltros(materia, filtros, reglasCarrera, horas) {
  if (filtros.anios.length > 0 && !filtros.anios.includes(String(materia.anioCursada))) return false

  if (filtros.rangosHoras.length > 0 && !filtros.rangosHoras.includes(calcularRangoHoras(materia.horasCatedra))) {
    return false
  }

  // A diferencia del filtro de categorías fijas de arriba, acá SÍ quedan
  // afuera las materias sin horas cargadas cuando el filtro está activo con
  // un rango distinto al completo — no hay forma de saber si entrarían.
  if (horas != null && (materia.horasCatedra == null || materia.horasCatedra < horas.min || materia.horasCatedra > horas.max)) {
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
