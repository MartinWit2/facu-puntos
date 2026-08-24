// Pool de puntos base de una materia: horas cátedra × el multiplicador de
// puntos por hora de la carrera del usuario. Todavía no incluye overrides
// manuales, bonus de promoción/firma ni recursada.
export function calcularPoolPuntos(horasCatedra, puntosPorHora) {
  const horas = Number(horasCatedra)
  if (!Number.isFinite(horas) || horas <= 0) return 0
  return horas * puntosPorHora
}
