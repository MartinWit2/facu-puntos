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

// Si una materia puntual tiene algo cargado (alguna nota, un resultado
// forzado a mano, o fue agregada por fuera del plan clonado).
function materiaTieneProgreso(materia) {
  return (
    materia.materiaCatalogoId == null ||
    materia.tickManual != null ||
    materia.parciales.some((parcial) => parcial.notas.some((nota) => nota != null)) ||
    materia.final.notas.some((nota) => nota != null)
  )
}

// Si el usuario tiene algo cargado en sus materias actuales. Se usa para
// decidir si hace falta advertir antes de un cambio de carrera, que borra y
// reclona todo user_materias.
export function tieneProgresoCargado(materias) {
  return materias.some(materiaTieneProgreso)
}

// Cuántas materias tienen algo cargado — mismo criterio que
// tieneProgresoCargado, pero como cantidad en vez de booleano (para mostrar
// "esto es lo que se pierde" antes de confirmar un cambio de carrera).
export function contarMateriasConProgreso(materias) {
  return materias.filter(materiaTieneProgreso).length
}
