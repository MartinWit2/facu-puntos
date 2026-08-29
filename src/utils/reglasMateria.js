// Reglas efectivas de UNA materia puntual: si tiene override cargado (no
// null), ese pisa al valor de la carrera; si no, se usa el de la carrera.
// puntosPorHora no tiene override por materia (solo pool_override, que pisa
// el pool ya calculado — eso se maneja aparte, no acá).
export function calcularReglasEfectivas(materia, reglasCarrera) {
  return {
    notaAprobacion: materia.notaAprobacionOverride ?? reglasCarrera.notaAprobacion,
    notaPromocion: materia.notaPromocionOverride ?? reglasCarrera.notaPromocion,
    permitePromocion: materia.permitePromocionOverride ?? reglasCarrera.permitePromocion,
    promocionPorPromedio: materia.promocionPorPromedioOverride ?? reglasCarrera.promocionPorPromedio,
    puntosPorHora: reglasCarrera.puntosPorHora,
  }
}
