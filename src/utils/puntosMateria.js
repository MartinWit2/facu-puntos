import { evaluarCursada } from './cursada'
import { calcularPoolPuntos } from './puntos'

// Puntos que aporta una materia AHORA MISMO, calculados de forma derivada a
// partir de su estado actual (no de un historial de transacciones):
// - Cada parcial aprobado suma su parte proporcional del pool.
// - Promocionar suma +50% del pool; aprobar por final suma +25%.
// - Si la materia está en "recursa", no aporta nada (0), sin importar lo que
//   había aprobado antes de recursar. Si vuelve a cursar y aprueba de nuevo,
//   vuelve a sumar con normalidad — no hace falta lógica de "descuento"
//   separada, se recalcula solo.
export function calcularPuntosMateria(materia) {
  const evaluacion = evaluarCursada(materia)
  if (evaluacion.estado === 'recursa') return 0

  const poolBase = calcularPoolPuntos(materia.horasCatedra)
  const puntosPorParcial = poolBase / materia.cantidadParciales
  const puntosParciales = evaluacion.resultadoParciales.resultados.reduce(
    (acc, r) => acc + (r.aprobado ? puntosPorParcial : 0),
    0,
  )

  let bonus = 0
  if (evaluacion.estado === 'promocion') bonus = poolBase * 0.5
  else if (evaluacion.estado === 'aprobada') bonus = poolBase * 0.25

  return Math.round((puntosParciales + bonus) * 100) / 100
}
