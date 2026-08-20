import MateriaBadge from '../components/MateriaBadge.jsx'
import { useMaterias } from '../hooks/useMaterias.js'
import { evaluarCursada } from '../utils/cursada'
import { calcularPoolPuntos } from '../utils/puntos'
import { calcularPuntosMateria } from '../utils/puntosMateria'
import './Progreso.css'

function Progreso() {
  const { materias } = useMaterias()

  const filas = materias
    .map((materia) => ({
      materia,
      evaluacion: evaluarCursada(materia),
      poolBase: calcularPoolPuntos(materia.horasCatedra),
      puntos: calcularPuntosMateria(materia),
    }))
    .sort((a, b) => a.materia.nombre.localeCompare(b.materia.nombre))

  const total = Math.round(filas.reduce((acc, f) => acc + f.puntos, 0) * 100) / 100

  return (
    <section className="page">
      <h1>Progreso / Puntos</h1>

      <div className="puntos-total-card">
        <span className="puntos-total-label">Puntos acumulados</span>
        <span className="puntos-total-valor">{total}</span>
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
