import MateriaBadge from '../components/MateriaBadge.jsx'
import { usePerfil } from '../context/usePerfil.js'
import { useCanjes } from '../hooks/useCanjes.js'
import { useMaterias } from '../hooks/useMaterias.js'
import {
  calcularPuntosCanjeados,
  calcularPuntosUsadosPorMateria,
  calcularSaldoDisponible,
  canjesDesde,
} from '../utils/canjes'
import { evaluarCursada } from '../utils/cursada'
import { calcularPoolPuntos } from '../utils/puntos'
import { calcularPuntosMateria, calcularPuntosTotales } from '../utils/puntosMateria'
import { calcularReglasEfectivas } from '../utils/reglasMateria'
import './ProgresoMobile.css'

function ProgresoMobile() {
  const { materias, cargando: cargandoMaterias } = useMaterias()
  const { canjes, cargando: cargandoCanjes } = useCanjes()
  const { perfil, reglasCarrera } = usePerfil()

  if (cargandoMaterias || cargandoCanjes) {
    return (
      <section className="page-mobile">
        <h1>Progreso</h1>
        <p className="page-placeholder">Cargando…</p>
      </section>
    )
  }

  // Mismo criterio que la versión de escritorio: los canjes de una carrera
  // anterior no cuentan acá (ver canjesDesde en utils/canjes.js).
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
        consumidaCompleta: evaluacion.estado !== 'recursa' && usado > 0 && disponible === 0,
      }
    })
    .filter(({ evaluacion, consumidaCompleta }) => evaluacion.estado !== 'pendiente' && !consumidaCompleta)
    .sort((a, b) => a.materia.nombre.localeCompare(b.materia.nombre))

  const ganados = calcularPuntosTotales(materias, reglasCarrera)
  const canjeados = calcularPuntosCanjeados(canjesCarreraActual)
  const saldoDisponible = calcularSaldoDisponible(ganados, canjesCarreraActual)

  return (
    <section className="page-mobile progreso-mobile">
      <h1>Progreso</h1>

      <div className="progreso-mobile-saldo">
        <span className="progreso-mobile-moneda" aria-hidden="true" />
        <div className="progreso-mobile-saldo-info">
          <span className="progreso-mobile-saldo-label">Saldo disponible</span>
          <span className={saldoDisponible < 0 ? 'progreso-mobile-saldo-valor negativo' : 'progreso-mobile-saldo-valor'}>
            {saldoDisponible}
          </span>
          <span className="progreso-mobile-saldo-canjeados">{canjeados} pts ya canjeados</span>
        </div>
      </div>

      <div className="progreso-mobile-resumen">
        <div className="progreso-mobile-resumen-card">
          <span className="progreso-mobile-resumen-label">Ganados</span>
          <span className="progreso-mobile-resumen-valor">{ganados}</span>
        </div>
        <div className="progreso-mobile-resumen-card">
          <span className="progreso-mobile-resumen-label">Canjeados</span>
          <span className="progreso-mobile-resumen-valor">{canjeados}</span>
        </div>
      </div>

      <section className="mobile-seccion">
        <h4 className="seccion-mobile-label">De dónde vienen</h4>
        {filas.length === 0 ? (
          <p className="page-placeholder">
            {materias.length === 0 ? 'Todavía no cargaste ninguna materia.' : 'No hay materias con puntos para mostrar por ahora.'}
          </p>
        ) : (
          <div className="progreso-mobile-lista">
            {filas.map(({ materia, evaluacion, poolBase, puntos, disponible }) => (
              <div key={materia.id} className="progreso-mobile-item">
                <div className="progreso-mobile-item-info">
                  <span className="progreso-mobile-item-nombre">{materia.nombre}</span>
                  <div className="progreso-mobile-item-meta-row">
                    <MateriaBadge estado={evaluacion.estado} compacto />
                    <span className="progreso-mobile-item-meta">Pool {poolBase}</span>
                  </div>
                </div>
                <div className="progreso-mobile-item-valor-bloque">
                  {evaluacion.estado === 'recursa' ? (
                    <span className="progreso-mobile-item-valor negativo">0</span>
                  ) : (
                    <>
                      <span className="progreso-mobile-item-valor">{disponible}</span>
                      {disponible < puntos && <span className="progreso-mobile-item-nota">de {puntos} ganados</span>}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  )
}

export default ProgresoMobile
