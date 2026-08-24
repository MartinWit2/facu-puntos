import { evaluarCursada } from './cursada'
import { calcularPoolPuntos } from './puntos'
import { calcularReglasEfectivas } from './reglasMateria'

// Puntos que aporta una materia AHORA MISMO, calculados de forma derivada a
// partir de su estado actual (no de un historial de transacciones):
// - Cada parcial aprobado suma su parte proporcional del pool.
// - Promocionar suma +50% del pool; aprobar por final suma +25%.
// - Si la materia está en "recursa", no aporta nada (0), sin importar lo que
//   había aprobado antes de recursar. Si vuelve a cursar y aprueba de nuevo,
//   vuelve a sumar con normalidad — no hace falta lógica de "descuento"
//   separada, se recalcula solo.
// `reglas` son las reglas EFECTIVAS de esta materia (carrera + overrides).
export function calcularPuntosMateria(materia, reglas) {
  const evaluacion = evaluarCursada(materia, reglas)
  if (evaluacion.estado === 'recursa') return 0

  const poolBase = calcularPoolPuntos(materia.horasCatedra, reglas.puntosPorHora)
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

// Suma de los puntos actuales de todas las materias (puntos "ganados", antes
// de restar lo canjeado en premios). `reglasCarrera` son las reglas de la
// carrera del usuario; cada materia combina sus propios overrides encima.
export function calcularPuntosTotales(materias, reglasCarrera) {
  const total = materias.reduce((acc, materia) => {
    const reglas = calcularReglasEfectivas(materia, reglasCarrera)
    return acc + calcularPuntosMateria(materia, reglas)
  }, 0)
  return Math.round(total * 100) / 100
}
