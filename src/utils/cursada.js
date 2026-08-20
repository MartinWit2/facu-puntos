import { NOTA_MINIMA_APROBACION, NOTA_MINIMA_PROMOCION } from '../constants'

// Recorre las instancias de un parcial (original + recuperatorios) en orden y
// se detiene apenas encuentra una nota >= 6 (ahí el parcial ya está
// aprobado, no hace falta cargar instancias siguientes).
export function evaluarParcial(notas) {
  for (let indice = 0; indice < notas.length; indice += 1) {
    const nota = notas[indice]
    if (nota == null) {
      return { aprobado: false, agotado: false, notaAprobacion: null, indiceInstancia: null }
    }
    if (nota >= NOTA_MINIMA_APROBACION) {
      return {
        aprobado: true,
        agotado: false,
        notaAprobacion: nota,
        indiceInstancia: indice,
        // "como máximo en su primer recuperatorio" => índice 0 (original) o 1 (recu 1).
        cumplePatronPromocion: nota >= NOTA_MINIMA_PROMOCION && indice <= 1,
      }
    }
  }
  // Se cargaron todas las instancias disponibles y ninguna llegó a 6+.
  return { aprobado: false, agotado: true, notaAprobacion: null, indiceInstancia: null }
}

export function evaluarParciales(materia) {
  const resultados = materia.parciales.map((parcial) => evaluarParcial(parcial.notas))
  return {
    resultados,
    todosAprobados: resultados.every((r) => r.aprobado),
    algunoAgotado: resultados.some((r) => r.agotado),
    cumplePatronPromocion: resultados.every((r) => r.aprobado && r.cumplePatronPromocion),
  }
}

// El final funciona igual que un parcial en cuanto a "se detiene en la
// primera instancia que llega a 6+", pero sin distinción de nota 8 (siempre
// vale lo mismo, sin importar la instancia).
export function evaluarFinal(materia) {
  const notas = materia.final.notas
  for (let indice = 0; indice < notas.length; indice += 1) {
    const nota = notas[indice]
    if (nota == null) {
      return { aprobado: false, agotado: false, notaAprobacion: null, indiceInstancia: null }
    }
    if (nota >= NOTA_MINIMA_APROBACION) {
      return { aprobado: true, agotado: false, notaAprobacion: nota, indiceInstancia: indice }
    }
  }
  return { aprobado: false, agotado: true, notaAprobacion: null, indiceInstancia: null }
}

// Resultado completo de la cursada: 'cursando' | 'promocion' | 'firma' | 'recursa' | 'aprobada'.
// El tick manual (a nivel cursada, no por parcial) puede forzar 'promocion' o
// 'firma' aunque las notas cargadas no cumplan la regla automática.
export function evaluarCursada(materia) {
  const resultadoParciales = evaluarParciales(materia)

  let estado
  if (materia.tickManual === 'promocion') {
    estado = 'promocion'
  } else if (materia.tickManual === 'firma') {
    estado = 'firma'
  } else if (resultadoParciales.algunoAgotado) {
    estado = 'recursa'
  } else if (!resultadoParciales.todosAprobados) {
    estado = 'cursando'
  } else if (resultadoParciales.cumplePatronPromocion) {
    estado = 'promocion'
  } else {
    estado = 'firma'
  }

  if (estado !== 'firma') {
    return { estado, resultadoParciales, resultadoFinal: null }
  }

  const resultadoFinal = evaluarFinal(materia)
  if (resultadoFinal.aprobado) {
    return { estado: 'aprobada', resultadoParciales, resultadoFinal }
  }
  if (resultadoFinal.agotado) {
    return { estado: 'recursa', resultadoParciales, resultadoFinal }
  }
  return { estado: 'firma', resultadoParciales, resultadoFinal }
}

function calcularPromedioParciales(materia) {
  const notasAprobacion = materia.parciales.map((p) => evaluarParcial(p.notas).notaAprobacion).filter((n) => n != null)
  if (notasAprobacion.length === 0) return null
  const promedio = notasAprobacion.reduce((acc, n) => acc + n, 0) / notasAprobacion.length
  return Math.round(promedio * 100) / 100
}

// Nota "automática" (por regla), sin considerar el override manual.
export function calcularNotaMateriaAutomatica(materia, evaluacion) {
  if (evaluacion.estado === 'promocion') return calcularPromedioParciales(materia)
  if (evaluacion.estado === 'aprobada') return evaluacion.resultadoFinal.notaAprobacion
  return null
}

// Nota final a mostrar: el override manual gana si está seteado.
export function calcularNotaMateria(materia, evaluacion) {
  if (materia.notaMateriaManual != null) return materia.notaMateriaManual
  return calcularNotaMateriaAutomatica(materia, evaluacion)
}

// Cuántas instancias (de un parcial o del final) mostrar en el formulario:
// hasta la primera vacía, o hasta la que aprobó, lo que venga primero.
export function contarInstanciasVisibles(notas) {
  for (let indice = 0; indice < notas.length; indice += 1) {
    const nota = notas[indice]
    if (nota == null) return indice + 1
    if (nota >= NOTA_MINIMA_APROBACION) return indice + 1
  }
  return notas.length
}
