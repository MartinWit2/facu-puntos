export function calcularPuntosCanjeados(canjes) {
  const total = canjes.reduce((acc, canje) => acc + canje.costoPuntos, 0)
  return Math.round(total * 100) / 100
}

// Filtra los canjes de antes de que empezara la carrera actual (ver
// perfiles.carrera_desde). Al cambiar de carrera el saldo tiene que arrancar
// en 0: los canjes de la carrera anterior ya se pagaron con puntos que esa
// carrera vieja había ganado, no tiene sentido que sigan descontando del
// saldo de la carrera nueva. El historial de canjes igual los sigue
// mostrando a todos — esto solo afecta la cuenta del saldo.
export function canjesDesde(canjes, carreraDesde) {
  if (!carreraDesde) return canjes
  const corte = new Date(carreraDesde).getTime()
  return canjes.filter((canje) => new Date(canje.fecha).getTime() >= corte)
}

// Cuánto de cada materia ya se usó como origen en canjes anteriores. Los
// canjes de antes de esta función (sin detalleOrigen) no aportan nada acá:
// no se puede reconstruir de qué materia salieron, pero eso no afecta el
// saldo total (que sigue sumando todo lo canjeado, tenga origen guardado o no).
export function calcularPuntosUsadosPorMateria(canjes) {
  const usados = new Map()
  for (const canje of canjes) {
    for (const origen of canje.detalleOrigen ?? []) {
      usados.set(origen.materiaId, (usados.get(origen.materiaId) ?? 0) + origen.puntos)
    }
  }
  return usados
}

// El saldo puede quedar negativo (ej. una materia recursó después de haber
// canjeado premios con esos puntos). Eso no revierte lo ya canjeado, solo
// bloquea poder canjear premios nuevos hasta volver a positivo.
export function calcularSaldoDisponible(puntosTotales, canjes) {
  return Math.round((puntosTotales - calcularPuntosCanjeados(canjes)) * 100) / 100
}
