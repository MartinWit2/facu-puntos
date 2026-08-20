const NOMBRES_ORDINALES = {
  1: '1er',
  2: '2do',
  3: '3ro',
  4: '4to',
  5: '5to',
  6: '6to',
  7: '7mo',
}

export function nombreAnio(anio) {
  return NOMBRES_ORDINALES[anio] ?? `${anio}°`
}
