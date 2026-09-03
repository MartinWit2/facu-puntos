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
      const resultadoOriginal = {
        aprobado: true,
        agotado: false,
        notaAprobacion: nota,
        indiceInstancia: indice,
        // "como máximo en su primer recuperatorio" => índice 0 (original) o 1 (recu 1).
        cumplePatronPromocion: nota >= reglas.notaPromocion && indice <= 1,
      }

      // Caso puntual: el original aprobó pero no llegó a nota de promoción.
      // Si la materia permite promoción y hay un primer recuperatorio
      // configurado, ese recu queda disponible para rendir IGUAL, de forma
      // opcional, buscando promocionar. Si se carga y llega a nota de
      // promoción, pasa a contar como el resultado de este parcial (mismo
      // patrón "en el original o el primer recu" de siempre). Si no se
      // carga, o se carga y no alcanza, el parcial se queda con el
      // resultado original tal cual — nunca empeora.
      if (
        indice === 0 &&
        !resultadoOriginal.cumplePatronPromocion &&
        reglas.permitePromocion &&
        notas.length > 1 &&
        notas[1] != null &&
        notas[1] >= reglas.notaPromocion
      ) {
        return {
          aprobado: true,
          agotado: false,
          notaAprobacion: notas[1],
          indiceInstancia: 1,
          cumplePatronPromocion: true,
        }
      }

      return resultadoOriginal
    }
  }
  // Se cargaron todas las instancias disponibles y ninguna llegó a la nota de aprobación.
  return { aprobado: false, agotado: true, notaAprobacion: null, indiceInstancia: null }
}

export function evaluarParciales(materia, reglas) {
  const resultados = materia.parciales.map((parcial) => evaluarParcial(parcial.notas, reglas))
  const todosAprobados = resultados.every((r) => r.aprobado)

  // En los dos modos, cada parcial tiene que haberse aprobado como máximo en
  // su primer recuperatorio (indiceInstancia <= 1) — lo único que cambia
  // entre uno y otro es si la nota de promoción se exige parcial por parcial
  // (modo normal) o en el PROMEDIO de las notas (modo "por promedio", ver
  // migración 0016).
  const cumplePatronPromocion = reglas.promocionPorPromedio
    ? todosAprobados &&
      resultados.every((r) => r.indiceInstancia <= 1) &&
      calcularPromedioParciales({ resultados }) >= reglas.notaPromocion
    : resultados.every((r) => r.aprobado && r.cumplePatronPromocion)

  return {
    resultados,
    todosAprobados,
    algunoAgotado: resultados.some((r) => r.agotado),
    cumplePatronPromocion,
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

// Resultado completo de la cursada: 'pendiente' | 'cursando' | 'promocion' |
// 'firma' | 'recursa' | 'aprobada'.
// `reglas` son las reglas EFECTIVAS de esta materia puntual (ya combinadas
// carrera + overrides, ver utils/reglasMateria.js).
// El tick manual (a nivel cursada, no por parcial) puede forzar 'promocion' o
// 'firma' aunque las notas cargadas no cumplan la regla automática — incluso
// si la carrera no permite promoción automática, el tick manual sigue
// pudiendo forzarla (es una excepción explícita del profesor).
// 'pendiente' vs 'cursando' es la ÚNICA distinción manual de este cálculo
// (materia.empezada) — acá solo se LEE tal cual está guardada. Quien la
// pone en true es la UI (mobile): al botón "Empezar a cursar" se le suma
// que cargar la nota o la fecha de un parcial también la fuerza a true de
// paso (ver actualizarNotaParcial en MateriaDetalleMobile.jsx/
// ProximosMobile.jsx), para que una materia con progreso real cargado no
// se quede mostrando "pendiente". Todo lo demás sigue siendo 100% derivado
// de las notas.
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
    estado = materia.empezada ? 'cursando' : 'pendiente'
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
// `esParcial` habilita el caso puntual del recu opcional para promocionar
// (ver evaluarParcial) — el final no tiene ese patrón, así que se lo deja
// desactivado por default para no mostrarle una instancia de más.
export function contarInstanciasVisibles(notas, reglas, { esParcial = false } = {}) {
  for (let indice = 0; indice < notas.length; indice += 1) {
    const nota = notas[indice]
    if (nota == null) return indice + 1
    if (nota >= reglas.notaAprobacion) {
      // Mismo caso puntual que en evaluarParcial: el original aprobó pero
      // no llega a nota de promoción, y queda un primer recu opcional para
      // intentar promocionar — se sigue mostrando esa instancia (vacía o
      // ya cargada), pero nunca más allá de ella.
      if (esParcial && indice === 0 && nota < reglas.notaPromocion && reglas.permitePromocion && notas.length > 1) {
        return 2
      }
      return indice + 1
    }
  }
  return notas.length
}
