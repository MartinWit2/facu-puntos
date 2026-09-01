import { evaluarCursada, evaluarFinal, evaluarParcial } from './cursada'

// Calcula qué tan avanzada está la cursada de una materia, en 0-100. Es
// puramente informativo (una barra de progreso en el detalle de materia),
// no participa en el cálculo de estado/promoción real — eso lo sigue
// haciendo evaluarCursada en cursada.js, que no se toca.
//
// Atajo importante: si la materia ya llegó a un estado terminal exitoso
// (promocionó, o aprobó por final — incluye el caso de un tick manual que
// fuerza "promoción"), el progreso es 100% directo, sin pasar por la
// cuenta de abajo. Antes de este atajo, una materia que permite promoción
// pero terminó el camino "firmó + aprobó el final" (en vez de promocionar)
// nunca podía llegar a 100%, porque esa rama de la cuenta reparte el 100%
// solo entre los parciales y nunca contaba el final — quedaba pegada en
// como mucho cantidadParciales / (cantidadParciales + 1). Forzar
// "Promoción manual" tampoco se reflejaba, por la misma razón: el tick
// manual no tocaba esta cuenta para nada.
//
// Regla para el resto de los casos (sección "4d" del handoff de rediseño):
// - Si la materia permite promoción, el 100% se reparte en partes iguales
//   entre los parciales, y cada uno solo suma su parte completa si se
//   aprobó con nota de promoción (no alcanza con aprobar simple).
// - Si NO permite promoción, el 100% se reparte entre parciales + final, y
//   cada parte suma con cualquier nota de aprobación.
// - Caso mixto que el handoff deja sin definición cerrada (un parcial se
//   aprueba "simple" en una materia que sí permite promoción): en vez de
//   sumar 0 para ese parcial, se le da el peso "chico" que tendría en el
//   esquema sin promoción (1 / (parciales + final)).
export function calcularProgresoMateria(materia, reglas) {
  const estado = evaluarCursada(materia, reglas).estado
  if (estado === 'promocion' || estado === 'aprobada') return 100

  const resultadosParciales = materia.parciales.map((parcial) => evaluarParcial(parcial.notas, reglas))
  const cantidadParciales = resultadosParciales.length
  if (cantidadParciales === 0) return 0

  if (reglas.permitePromocion) {
    const pesoCompleto = 1 / cantidadParciales
    const pesoChico = 1 / (cantidadParciales + 1)
    const avance = resultadosParciales.reduce((acumulado, resultado) => {
      if (!resultado.aprobado) return acumulado
      return acumulado + (resultado.notaAprobacion >= reglas.notaPromocion ? pesoCompleto : pesoChico)
    }, 0)
    return Math.round(Math.min(avance, 1) * 100)
  }

  const resultadoFinal = evaluarFinal(materia, reglas)
  const partesAprobadas = resultadosParciales.filter((r) => r.aprobado).length + (resultadoFinal.aprobado ? 1 : 0)
  return Math.round((partesAprobadas / (cantidadParciales + 1)) * 100)
}
