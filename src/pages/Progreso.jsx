import ExplicacionPuntos from '../components/ExplicacionPuntos.jsx'
import MateriaBadge from '../components/MateriaBadge.jsx'
import { usePerfil } from '../context/usePerfil.js'
import { useCanjes } from '../hooks/useCanjes.js'
import { useMaterias } from '../hooks/useMaterias.js'
import { calcularPuntosUsadosPorMateria, calcularSaldoDisponible, canjesDesde } from '../utils/canjes'
import { evaluarCursada } from '../utils/cursada'
import { calcularPoolPuntos } from '../utils/puntos'
import { calcularPuntosMateria, calcularPuntosTotales } from '../utils/puntosMateria'
import { calcularReglasEfectivas } from '../utils/reglasMateria'
import './Progreso.css'

function Progreso() {
  const { materias, cargando: cargandoMaterias } = useMaterias()
  const { canjes, cargando: cargandoCanjes } = useCanjes()
  const { perfil, reglasCarrera } = usePerfil()

  if (cargandoMaterias || cargandoCanjes) {
    return (
      <section className="page">
        <h1>Progreso / Puntos</h1>
        <p className="page-placeholder">Cargando…</p>
      </section>
    )
  }

  // Los canjes de una carrera anterior (si el usuario cambió de carrera) no
  // cuentan para esta pantalla: ni descuentan del saldo ni "gastan" puntos
  // de las materias nuevas (que ya arrancan de cero de cualquier forma).
  const canjesCarreraActual = canjesDesde(canjes, perfil?.carrera_desde)
  const usadosPorMateria = calcularPuntosUsadosPorMateria(canjesCarreraActual)

  const filas = materias
    .map((materia) => {
      const reglas = calcularReglasEfectivas(materia, reglasCarrera)
      const evaluacion = evaluarCursada(materia, reglas)
      const puntos = calcularPuntosMateria(materia, reglas)
      const usado = usadosPorMateria.get(materia.id) ?? 0
      const disponible = Math.max(0, Math.round((puntos - usado) * 100) / 100)
      return {
        materia,
        evaluacion,
        poolBase: calcularPoolPuntos(materia.horasCatedra, reglas.puntosPorHora),
        puntos,
        disponible,
        // Ya se gastaron en canjes todos los puntos que había ganado (y no es
        // que nunca haya ganado nada): no aporta más nada útil a la pantalla.
        consumidaCompleta: evaluacion.estado !== 'recursa' && usado > 0 && disponible === 0,
      }
    })
    // Las materias Pendientes (sin empezar) no aportan puntos todavía, así que
    // no tiene sentido listarlas acá: alargarían la pantalla sin mostrar nada útil.
    // Tampoco las marcadas "no sumar puntos": no aportan nada (ver calcularPuntosMateria).
    .filter(
      ({ materia, evaluacion, consumidaCompleta }) =>
        materia.poolOverride !== 0 && evaluacion.estado !== 'pendiente' && !consumidaCompleta,
    )
    .sort((a, b) => a.materia.nombre.localeCompare(b.materia.nombre))

  const total = calcularPuntosTotales(materias, reglasCarrera)
  const saldoDisponible = calcularSaldoDisponible(total, canjesCarreraActual)

  return (
    <section className="page">
      <h1>Progreso / Puntos</h1>

      <div className="puntos-hero">
        <span className="puntos-hero-icono" aria-hidden="true">
          🪙
        </span>
        <div className="puntos-hero-info">
          <span className="puntos-hero-label">Saldo disponible</span>
          <span className={saldoDisponible < 0 ? 'puntos-hero-valor puntos-recursa' : 'puntos-hero-valor'}>
            {saldoDisponible}
          </span>
        </div>
      </div>

      <div className="puntos-total-card puntos-total-secundario">
        <span className="puntos-total-label">Puntos acumulados (antes de canjes)</span>
        <span className="puntos-total-valor">{total}</span>
      </div>

      <ExplicacionPuntos reglasCarrera={reglasCarrera} />

      {filas.length === 0 ? (
        <p className="page-placeholder">
          {materias.length === 0
            ? 'Todavía no cargaste ninguna materia.'
            : 'No hay materias con puntos para mostrar por ahora.'}
        </p>
      ) : (
        <ul className="puntos-lista">
          {filas.map(({ materia, evaluacion, poolBase, puntos, disponible }) => (
            <li key={materia.id} className="puntos-item">
              <div className="puntos-item-info">
                <div className="puntos-item-nombre-row">
                  <span className="puntos-item-nombre">{materia.nombre}</span>
                  <MateriaBadge estado={evaluacion.estado} />
                </div>
                <span className="puntos-item-meta">Pool base: {poolBase} pts</span>
              </div>
              <div className="puntos-item-valor">
                {evaluacion.estado === 'recursa' ? (
                  <span className="puntos-valor puntos-recursa">
                    0 pts <small>(recursa, no suma)</small>
                  </span>
                ) : (
                  <span className="puntos-valor">
                    {disponible} pts {disponible < puntos && <small>(de {puntos} ganados)</small>}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default Progreso
