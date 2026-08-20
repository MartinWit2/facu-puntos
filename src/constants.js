// Constante global del sistema de puntos: 1 punto por cada hora cátedra.
// Ajustable a mano si en algún momento se decide cambiar la relación.
export const PUNTOS_POR_HORA_CATEDRA = 1

export const DEFAULT_CANTIDAD_PARCIALES = 2
export const DEFAULT_CANTIDAD_RECUPERATORIOS = 2
export const DEFAULT_CANTIDAD_INSTANCIAS_FINAL = 4

// Fijas, no configurables (spec).
export const NOTA_MINIMA_APROBACION = 6
export const NOTA_MINIMA_PROMOCION = 8

// Cortes de nivel según el pool de puntos de la materia. Default,
// ajustables acá si hiciera falta cambiar los rangos — no se recalculan
// dinámicamente en base a las materias cargadas (no es por tercios).
export const NIVEL_UMBRAL_1_2 = 100 // pool < este valor => nivel 1
export const NIVEL_UMBRAL_2_3 = 160 // pool >= este valor => nivel 3 (entre medio => nivel 2)
