// Arma el estado de notas/cursada inicial de una materia nueva, a partir de
// su configuración (cantidad de parciales, recuperatorios por parcial e
// instancias de final).
export function crearEstructuraNotas({ cantidadParciales, cantidadRecuperatorios, cantidadInstanciasFinal }) {
  return {
    parciales: Array.from({ length: cantidadParciales }, () => ({
      notas: Array.from({ length: cantidadRecuperatorios + 1 }, () => null),
    })),
    final: {
      notas: Array.from({ length: cantidadInstanciasFinal }, () => null),
    },
    tickManual: null,
    notaMateriaManual: null,
  }
}

// Cuando se edita la cantidad de parciales/recuperatorios/instancias de final
// de una materia que ya tiene notas cargadas, redimensiona los arrays
// preservando las notas existentes que todavía entran en la nueva forma.
export function ajustarEstructuraNotas(materiaAnterior, datosNuevos) {
  const cantidadParciales = datosNuevos.cantidadParciales ?? materiaAnterior.cantidadParciales
  const cantidadRecuperatorios = datosNuevos.cantidadRecuperatorios ?? materiaAnterior.cantidadRecuperatorios
  const cantidadInstanciasFinal = datosNuevos.cantidadInstanciasFinal ?? materiaAnterior.cantidadInstanciasFinal

  const largoInstanciasParcial = cantidadRecuperatorios + 1
  const parciales = Array.from({ length: cantidadParciales }, (_, i) => {
    const notasAnteriores = materiaAnterior.parciales?.[i]?.notas ?? []
    return {
      notas: Array.from({ length: largoInstanciasParcial }, (_, j) => notasAnteriores[j] ?? null),
    }
  })

  const notasFinalAnteriores = materiaAnterior.final?.notas ?? []
  const final = {
    notas: Array.from({ length: cantidadInstanciasFinal }, (_, i) => notasFinalAnteriores[i] ?? null),
  }

  return { parciales, final }
}
