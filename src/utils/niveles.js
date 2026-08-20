import { NIVEL_UMBRAL_1_2, NIVEL_UMBRAL_2_3 } from '../constants'
import { calcularPoolPuntos } from './puntos'

export function calcularNivelAutomatico(poolPuntos) {
  if (poolPuntos >= NIVEL_UMBRAL_2_3) return 3
  if (poolPuntos >= NIVEL_UMBRAL_1_2) return 2
  return 1
}

// Nivel real de una materia: el override manual gana si está seteado, sin
// disparar ningún recálculo de las demás materias.
export function calcularNivelMateria(materia) {
  if (materia.nivelManual != null) return materia.nivelManual
  return calcularNivelAutomatico(calcularPoolPuntos(materia.horasCatedra))
}
