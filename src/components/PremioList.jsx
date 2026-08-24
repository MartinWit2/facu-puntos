import { useState } from 'react'
import PremioForm from './PremioForm.jsx'

function agruparPorCategoria(premios) {
  const grupos = new Map()
  for (const premio of premios) {
    const grupo = grupos.get(premio.categoria) ?? []
    grupo.push(premio)
    grupos.set(premio.categoria, grupo)
  }
  return [...grupos.entries()]
    .sort(([categoriaA], [categoriaB]) => categoriaA.localeCompare(categoriaB))
    .map(([categoria, items]) => [categoria, items.slice().sort((a, b) => a.nombre.localeCompare(b.nombre))])
}

function PremioList({
  premios,
  saldoDisponible,
  premioEditandoId,
  categoriasExistentes,
  rangoPool,
  onIniciarEdicion,
  onGuardarEdicion,
  onCancelarEdicion,
  onEliminar,
  onCanjear,
}) {
  const [confirmandoEliminarId, setConfirmandoEliminarId] = useState(null)
  const [confirmandoCanjeId, setConfirmandoCanjeId] = useState(null)

  if (premios.length === 0) {
    return <p className="page-placeholder">Todavía no cargaste ningún premio.</p>
  }

  const grupos = agruparPorCategoria(premios)

  return (
    <div className="premio-list">
      {grupos.map(([categoria, items]) => (
        <section key={categoria} className="premio-group">
          <h3>{categoria}</h3>
          <ul>
            {items.map((premio) => {
              if (premio.id === premioEditandoId) {
                return (
                  <li key={premio.id} className="premio-card premio-card-editando">
                    <PremioForm
                      valoresIniciales={premio}
                      categoriasExistentes={categoriasExistentes}
                      rangoPool={rangoPool}
                      submitLabel="Guardar cambios"
                      onSubmit={onGuardarEdicion}
                      onCancel={onCancelarEdicion}
                    />
                  </li>
                )
              }

              const alcanza = saldoDisponible >= premio.costoPuntos

              return (
                <li key={premio.id} className="premio-card">
                  <div className="premio-card-info">
                    <span className="premio-nombre">{premio.nombre}</span>
                    <span className="premio-meta">{premio.costoPuntos} pts</span>
                  </div>

                  <div className="premio-card-actions">
                    {confirmandoCanjeId === premio.id ? (
                      <>
                        <span className="confirmar-texto">¿Canjear por {premio.costoPuntos} pts?</span>
                        <button
                          type="button"
                          className="btn-confirmar"
                          onClick={() => {
                            onCanjear(premio)
                            setConfirmandoCanjeId(null)
                          }}
                        >
                          Sí
                        </button>
                        <button type="button" onClick={() => setConfirmandoCanjeId(null)}>
                          No
                        </button>
                      </>
                    ) : confirmandoEliminarId === premio.id ? (
                      <>
                        <span className="confirmar-texto">¿Eliminar?</span>
                        <button
                          type="button"
                          className="btn-confirmar"
                          onClick={() => {
                            onEliminar(premio.id)
                            setConfirmandoEliminarId(null)
                          }}
                        >
                          Sí
                        </button>
                        <button type="button" onClick={() => setConfirmandoEliminarId(null)}>
                          No
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="btn-canjear"
                          disabled={!alcanza}
                          title={alcanza ? undefined : 'No te alcanzan los puntos todavía'}
                          onClick={() => setConfirmandoCanjeId(premio.id)}
                        >
                          Canjear
                        </button>
                        <button type="button" onClick={() => onIniciarEdicion(premio)}>
                          Editar
                        </button>
                        <button type="button" onClick={() => setConfirmandoEliminarId(premio.id)}>
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}

export default PremioList
