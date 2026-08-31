import { useState } from 'react'
import { Link } from 'react-router-dom'
import MateriaBadge from './MateriaBadge.jsx'
import { evaluarCursada } from '../utils/cursada'
import { calcularPoolPuntos } from '../utils/puntos'
import { calcularReglasEfectivas } from '../utils/reglasMateria'
import { nombreAnio } from '../utils/anio'

function agruparPorAnio(materias) {
  const grupos = new Map()
  for (const materia of materias) {
    const grupo = grupos.get(materia.anioCursada) ?? []
    grupo.push(materia)
    grupos.set(materia.anioCursada, grupo)
  }
  return [...grupos.entries()]
    .sort(([anioA], [anioB]) => anioA - anioB)
    .map(([anio, items]) => [anio, items.slice().sort((a, b) => a.nombre.localeCompare(b.nombre))])
}

function MateriaList({
  materias,
  reglasCarrera,
  onEditar,
  onEliminar,
  onToggleEmpezada,
  filtrosActivos,
  modoSeleccion,
  seleccionadas,
  onToggleSeleccion,
}) {
  const [confirmandoId, setConfirmandoId] = useState(null)

  if (materias.length === 0) {
    return <p className="page-placeholder">Todavía no cargaste ninguna materia.</p>
  }

  const grupos = agruparPorAnio(materias)

  return (
    <div className="materia-list">
      {grupos.map(([anio, items]) => (
        // La key incluye filtrosActivos para que, al activar o quitar
        // filtros, el <details> se remonte con su valor `open` inicial
        // correcto (abierto mientras hay filtros, cerrado si no hay
        // ninguno), sin pelearse con los clics manuales del usuario.
        <details key={`${anio}-${filtrosActivos}`} className="materia-group" open={filtrosActivos}>
          <summary>
            {nombreAnio(anio)} año <span className="materia-group-cantidad">({items.length})</span>
          </summary>
          <ul>
            {items.map((materia) => {
              const reglas = calcularReglasEfectivas(materia, reglasCarrera)
              const estado = evaluarCursada(materia, reglas).estado
              const faltanHoras = materia.horasCatedra == null

              return (
                <li key={materia.id} className="materia-card">
                  <div className="materia-card-info">
                    <div className="materia-nombre-row">
                      {modoSeleccion && (
                        <input
                          type="checkbox"
                          className="materia-seleccion-checkbox"
                          checked={seleccionadas.has(materia.id)}
                          onChange={() => onToggleSeleccion(materia.id)}
                          aria-label={`Seleccionar ${materia.nombre}`}
                        />
                      )}
                      <Link to={`/materias/${materia.id}`} className="materia-nombre">
                        {materia.nombre}
                      </Link>
                      <MateriaBadge estado={estado} />
                    </div>
                    {faltanHoras ? (
                      <span className="materia-aviso">Cargá las horas cátedra de esta materia</span>
                    ) : (
                      <span className="materia-meta">
                        {materia.horasCatedra} hs cátedra · pool{' '}
                        {calcularPoolPuntos(materia.horasCatedra, reglas.puntosPorHora)} pts
                      </span>
                    )}
                    <span className="materia-meta">
                      {materia.cantidadParciales} parciales · {materia.cantidadRecuperatorios} recu c/u ·{' '}
                      {materia.cantidadInstanciasFinal} instancias de final
                    </span>
                  </div>
                  <div className="materia-card-actions">
                    {confirmandoId === materia.id ? (
                      <>
                        <span className="confirmar-texto">¿Eliminar?</span>
                        <button
                          type="button"
                          className="btn-confirmar"
                          onClick={() => {
                            onEliminar(materia.id)
                            setConfirmandoId(null)
                          }}
                        >
                          Sí
                        </button>
                        <button type="button" onClick={() => setConfirmandoId(null)}>
                          No
                        </button>
                      </>
                    ) : (
                      <>
                        {estado === 'pendiente' && (
                          <button type="button" onClick={() => onToggleEmpezada(materia)}>
                            Empezar a cursar
                          </button>
                        )}
                        <button type="button" onClick={() => onEditar(materia)}>
                          Editar
                        </button>
                        <button type="button" onClick={() => setConfirmandoId(materia.id)}>
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </details>
      ))}
    </div>
  )
}

export default MateriaList
