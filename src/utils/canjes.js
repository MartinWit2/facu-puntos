export function calcularPuntosCanjeados(canjes) {
  const total = canjes.reduce((acc, canje) => acc + canje.costoPuntos, 0)
  return Math.round(total * 100) / 100
}

// El saldo puede quedar negativo (ej. una materia recursó después de haber
// canjeado premios con esos puntos). Eso no revierte lo ya canjeado, solo
// bloquea poder canjear premios nuevos hasta volver a positivo.
export function calcularSaldoDisponible(puntosTotales, canjes) {
  return Math.round((puntosTotales - calcularPuntosCanjeados(canjes)) * 100) / 100
}
