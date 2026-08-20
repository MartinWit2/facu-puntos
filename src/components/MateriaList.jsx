import { useState } from 'react'
import { Link } from 'react-router-dom'
import MateriaBadge from './MateriaBadge.jsx'
import NivelBadge from './NivelBadge.jsx'
import { evaluarCursada } from '../utils/cursada'
import { calcularNivelMateria } from '../utils/niveles'
import { calcularPoolPuntos } from '../utils/puntos'
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

function MateriaList({ materias, onEditar, onEliminar }) {
  const [confirmandoId, setConfirmandoId] = useState(null)

  if (materias.length === 0) {
    return <p className="page-placeholder">Todavía no cargaste ninguna materia.</p>
  }

  const grupos = agruparPorAnio(materias)

  return (
    <div className="materia-list">
      {grupos.map(([anio, items]) => (
        <section key={anio} className="materia-group">
          <h3>{nombreAnio(anio)} año</h3>
          <ul>
            {items.map((materia) => (
              <li key={materia.id} className="materia-card">
                <div className="materia-card-info">
                  <div className="materia-nombre-row">
                    <Link to={`/materias/${materia.id}`} className="materia-nombre">
                      {materia.nombre}
                    </Link>
                    <MateriaBadge estado={evaluarCursada(materia).estado} />
                    <NivelBadge nivel={calcularNivelMateria(materia)} />
                  </div>
                  <span className="materia-meta">
                    {materia.horasCatedra} hs cátedra · pool {calcularPoolPuntos(materia.horasCatedra)} pts
                  </span>
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
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export default MateriaList
