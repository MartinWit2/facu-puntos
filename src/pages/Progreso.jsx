import MateriaBadge from '../components/MateriaBadge.jsx'
import { useCanjes } from '../hooks/useCanjes.js'
import { useMaterias } from '../hooks/useMaterias.js'
import { calcularSaldoDisponible } from '../utils/canjes'
import { evaluarCursada } from '../utils/cursada'
import { calcularPoolPuntos } from '../utils/puntos'
import { calcularPuntosMateria, calcularPuntosTotales } from '../utils/puntosMateria'
import './Progreso.css'

function Progreso() {
  const { materias } = useMaterias()
  const { canjes } = useCanjes()

  const filas = materias
    .map((materia) => ({
      materia,
      evaluacion: evaluarCursada(materia),
      poolBase: calcularPoolPuntos(materia.horasCatedra),
      puntos: calcularPuntosMateria(materia),
    }))
    .sort((a, b) => a.materia.nombre.localeCompare(b.materia.nombre))

  const total = calcularPuntosTotales(materias)
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
