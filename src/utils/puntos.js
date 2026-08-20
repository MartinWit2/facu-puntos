import { PUNTOS_POR_HORA_CATEDRA } from '../constants'

// Pool de puntos base de una materia: horas cátedra * la constante global.
// Todavía no incluye overrides manuales, bonus de promoción/firma ni recursada.
export function calcularPoolPuntos(horasCatedra, puntosPorHora = PUNTOS_POR_HORA_CATEDRA) {
  const horas = Number(horasCatedra)
  if (!Number.isFinite(horas) || horas <= 0) return 0
  return horas * puntosPorHora
}
