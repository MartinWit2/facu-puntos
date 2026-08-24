// Recorre las instancias de un parcial (original + recuperatorios) en orden y
// se detiene apenas encuentra una nota que llega a la nota de aprobación de
// la materia (ahí el parcial ya está aprobado, no hace falta cargar
// instancias siguientes).
export function evaluarParcial(notas, reglas) {
  for (let indice = 0; indice < notas.length; indice += 1) {
    const nota = notas[indice]
    if (nota == null) {
      return { aprobado: false, agotado: false, notaAprobacion: null, indiceInstancia: null }
    }
    if (nota >= reglas.notaAprobacion) {
      return {
        aprobado: true,
        agotado: false,
        notaAprobacion: nota,
        indiceInstancia: indice,
        // "como máximo en su primer recuperatorio" => índice 0 (original) o 1 (recu 1).
        cumplePatronPromocion: nota >= reglas.notaPromocion && indice <= 1,
      }
    }
  }
  // Se cargaron todas las instancias disponibles y ninguna llegó a la nota de aprobación.
  return { aprobado: false, agotado: true, notaAprobacion: null, indiceInstancia: null }
}

export function evaluarParciales(materia, reglas) {
  const resultados = materia.parciales.map((parcial) => evaluarParcial(parcial.notas, reglas))
  return {
    resultados,
    todosAprobados: resultados.every((r) => r.aprobado),
    algunoAgotado: resultados.some((r) => r.agotado),
    cumplePatronPromocion: resultados.every((r) => r.aprobado && r.cumplePatronPromocion),
  }
}

// El final funciona igual que un parcial en cuanto a "se detiene en la
// primera instancia que aprueba", pero sin distinción de nota de promoción
// (siempre vale lo mismo, sin importar la instancia).
export function evaluarFinal(materia, reglas) {
  const notas = materia.final.notas
  for (let indice = 0; indice < notas.length; indice += 1) {
    const nota = notas[indice]
    if (nota == null) {
      return { aprobado: false, agotado: false, notaAprobacion: null, indiceInstancia: null }
    }
    if (nota >= reglas.notaAprobacion) {
      return { aprobado: true, agotado: false, notaAprobacion: nota, indiceInstancia: indice }
    }
  }
  return { aprobado: false, agotado: true, notaAprobacion: null, indiceInstancia: null }
}

// Resultado completo de la cursada: 'cursando' | 'promocion' | 'firma' | 'recursa' | 'aprobada'.
// `reglas` son las reglas EFECTIVAS de esta materia puntual (ya combinadas
// carrera + overrides, ver utils/reglasMateria.js).
// El tick manual (a nivel cursada, no por parcial) puede forzar 'promocion' o
// 'firma' aunque las notas cargadas no cumplan la regla automática — incluso
// si la carrera no permite promoción automática, el tick manual sigue
// pudiendo forzarla (es una excepción explícita del profesor).
export function evaluarCursada(materia, reglas) {
  const resultadoParciales = evaluarParciales(materia, reglas)

  let estado
  if (materia.tickManual === 'promocion') {
    estado = 'promocion'
  } else if (materia.tickManual === 'firma') {
    estado = 'firma'
  } else if (resultadoParciales.algunoAgotado) {
    estado = 'recursa'
  } else if (!resultadoParciales.todosAprobados) {
    estado = 'cursando'
  } else if (reglas.permitePromocion && resultadoParciales.cumplePatronPromocion) {
    estado = 'promocion'
  } else {
    estado = 'firma'
  }

  if (estado !== 'firma') {
    return { estado, resultadoParciales, resultadoFinal: null }
  }

  const resultadoFinal = evaluarFinal(materia, reglas)
  if (resultadoFinal.aprobado) {
    return { estado: 'aprobada', resultadoParciales, resultadoFinal }
  }
  if (resultadoFinal.agotado) {
    return { estado: 'recursa', resultadoParciales, resultadoFinal }
  }
  return { estado: 'firma', resultadoParciales, resultadoFinal }
}

function calcularPromedioParciales(resultadoParciales) {
  const notasAprobacion = resultadoParciales.resultados.map((r) => r.notaAprobacion).filter((n) => n != null)
  if (notasAprobacion.length === 0) return null
  const promedio = notasAprobacion.reduce((acc, n) => acc + n, 0) / notasAprobacion.length
  return Math.round(promedio * 100) / 100
}

// Nota "automática" (por regla), sin considerar el override manual.
export function calcularNotaMateriaAutomatica(evaluacion) {
  if (evaluacion.estado === 'promocion') return calcularPromedioParciales(evaluacion.resultadoParciales)
  if (evaluacion.estado === 'aprobada') return evaluacion.resultadoFinal.notaAprobacion
  return null
}

// Cuántas instancias (de un parcial o del final) mostrar en el formulario:
// hasta la primera vacía, o hasta la que aprobó, lo que venga primero.
export function contarInstanciasVisibles(notas, reglas) {
  for (let indice = 0; indice < notas.length; indice += 1) {
    const nota = notas[indice]
    if (nota == null) return indice + 1
    if (nota >= reglas.notaAprobacion) return indice + 1
  }
  return notas.length
}
