import ExplicacionPuntos from '../components/ExplicacionPuntos.jsx'
import MateriaBadge from '../components/MateriaBadge.jsx'
import { usePerfil } from '../context/usePerfil.js'
import { useCanjes } from '../hooks/useCanjes.js'
import { useMaterias } from '../hooks/useMaterias.js'
import { calcularSaldoDisponible } from '../utils/canjes'
import { evaluarCursada } from '../utils/cursada'
import { calcularPoolPuntos } from '../utils/puntos'
import { calcularPuntosMateria, calcularPuntosTotales } from '../utils/puntosMateria'
import { calcularReglasEfectivas } from '../utils/reglasMateria'
import './Progreso.css'

function Progreso() {
  const { materias, cargando: cargandoMaterias } = useMaterias()
  const { canjes, cargando: cargandoCanjes } = useCanjes()
  const { reglasCarrera } = usePerfil()

  if (cargandoMaterias || cargandoCanjes) {
    return (
      <section className="page">
        <h1>Progreso / Puntos</h1>
        <p className="page-placeholder">Cargando…</p>
      </section>
    )
  }

  const filas = materias
    .map((materia) => {
      const reglas = calcularReglasEfectivas(materia, reglasCarrera)
      return {
        materia,
        evaluacion: evaluarCursada(materia, reglas),
        poolBase: calcularPoolPuntos(materia.horasCatedra, reglas.puntosPorHora),
        puntos: calcularPuntosMateria(materia, reglas),
      }
    })
    .sort((a, b) => a.materia.nombre.localeCompare(b.materia.nombre))

  const total = calcularPuntosTotales(materias, reglasCarrera)
  const saldoDisponible = calcularSaldoDisponible(total, canjes)

  return (
    <section className="page">
      <h1>Progreso / Puntos</h1>

      <div className="puntos-totales-row">
        <div className="puntos-total-card">
          <span className="puntos-total-label">Puntos acumulados</span>
          <span className="puntos-total-valor">{total}</span>
        </div>
        <div className="puntos-total-card">
          <span className="puntos-total-label">Saldo disponible (después de canjes)</span>
          <span className={saldoDisponible < 0 ? 'puntos-total-valor puntos-recursa' : 'puntos-total-valor'}>
            {saldoDisponible}
          </span>
        </div>
      </div>

      <ExplicacionPuntos reglasCarrera={reglasCarrera} />

      {filas.length === 0 ? (
        <p className="page-placeholder">Todavía no cargaste ninguna materia.</p>
      ) : (
        <ul className="puntos-lista">
          {filas.map(({ materia, evaluacion, poolBase, puntos }) => (
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
                  <span className="puntos-valor">{puntos} pts</span>
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
