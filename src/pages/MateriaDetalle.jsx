import { Link, useParams } from 'react-router-dom'
import MateriaBadge from '../components/MateriaBadge.jsx'
import NivelBadge from '../components/NivelBadge.jsx'
import { NOTA_MINIMA_APROBACION } from '../constants'
import { useMaterias } from '../hooks/useMaterias.js'
import { nombreAnio } from '../utils/anio'
import { calcularNotaMateriaAutomatica, contarInstanciasVisibles, evaluarCursada } from '../utils/cursada'
import { calcularNivelAutomatico, calcularNivelMateria } from '../utils/niveles'
import { calcularPoolPuntos } from '../utils/puntos'
import './MateriaDetalle.css'

function etiquetasParcial(cantidadInstancias) {
  return Array.from({ length: cantidadInstancias }, (_, i) => (i === 0 ? 'Nota original' : `Recuperatorio ${i}`))
}

function etiquetasFinal(cantidadInstancias) {
  return Array.from({ length: cantidadInstancias }, (_, i) => `Instancia ${i + 1}`)
}

function InstanciasNotas({ notas, labels, resultado, onChangeNota }) {
  const visibles = contarInstanciasVisibles(notas)

  return (
    <div className="instancias-notas">
      <div className="instancias-inputs">
        {labels.slice(0, visibles).map((label, indice) => (
          <label key={label} className="instancia-input">
            {label}
            <input
              type="number"
              min="1"
              max="10"
              step="0.5"
              value={notas[indice] ?? ''}
              onChange={(e) => onChangeNota(indice, e.target.value)}
            />
          </label>
        ))}
      </div>
      {resultado.aprobado && <span className="instancia-resultado ok">Aprobado con {resultado.notaAprobacion}</span>}
      {resultado.agotado && (
        <span className="instancia-resultado fail">No llegó a {NOTA_MINIMA_APROBACION} en ninguna instancia</span>
      )}
    </div>
  )
}

function MateriaDetalle() {
  const { id } = useParams()
  const { materias, editarMateria } = useMaterias()
  const materia = materias.find((m) => m.id === id)

  if (!materia) {
    return (
      <section className="page">
        <p className="page-placeholder">No encontramos esa materia.</p>
        <Link to="/">← Volver a Materias</Link>
      </section>
    )
  }

  const evaluacion = evaluarCursada(materia)
  const evaluacionAutomatica = evaluarCursada({ ...materia, tickManual: null })
  const notaAutomatica = calcularNotaMateriaAutomatica(materia, evaluacion)
  const muestraNotaMateria = evaluacion.estado === 'promocion' || evaluacion.estado === 'aprobada'
  const muestraFinal = evaluacion.resultadoFinal !== null
  const poolBase = calcularPoolPuntos(materia.horasCatedra)
  const nivelAutomatico = calcularNivelAutomatico(poolBase)
  const nivelActual = calcularNivelMateria(materia)

  const actualizarNotaParcial = (indiceParcial, indiceInstancia, valor) => {
    const nota = valor === '' ? null : Number(valor)
    const parciales = materia.parciales.map((p, i) =>
      i !== indiceParcial ? p : { notas: p.notas.map((n, j) => (j === indiceInstancia ? nota : n)) },
    )
    editarMateria(materia.id, { parciales })
  }

  const actualizarNotaFinal = (indiceInstancia, valor) => {
    const nota = valor === '' ? null : Number(valor)
    const notas = materia.final.notas.map((n, j) => (j === indiceInstancia ? nota : n))
    editarMateria(materia.id, { final: { notas } })
  }

  const handleTick = (valor) => {
    editarMateria(materia.id, { tickManual: materia.tickManual === valor ? null : valor })
  }

  const handleNotaManual = (valor) => {
    editarMateria(materia.id, { notaMateriaManual: valor === '' ? null : Number(valor) })
  }

  const handleNivelManual = (nivel) => {
    editarMateria(materia.id, { nivelManual: materia.nivelManual === nivel ? null : nivel })
  }

  return (
    <section className="page materia-detalle">
      <Link to="/" className="volver-link">
        ← Volver a Materias
      </Link>

      <div className="detalle-header">
        <h1>{materia.nombre}</h1>
        <MateriaBadge estado={evaluacion.estado} />
        <NivelBadge nivel={nivelActual} />
      </div>
      <p className="detalle-meta">
        {nombreAnio(materia.anioCursada)} año · {materia.horasCatedra} hs cátedra · pool base {poolBase} pts
      </p>

      <section className="detalle-seccion">
        <h2>Parciales</h2>
        <div className="parciales-grid">
          {materia.parciales.map((parcial, indice) => (
            <div key={indice} className="parcial-card">
              <h3>Parcial {indice + 1}</h3>
              <InstanciasNotas
                notas={parcial.notas}
                labels={etiquetasParcial(parcial.notas.length)}
                resultado={evaluacion.resultadoParciales.resultados[indice]}
                onChangeNota={(indiceInstancia, valor) => actualizarNotaParcial(indice, indiceInstancia, valor)}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="detalle-seccion">
        <h2>Resultado de la cursada</h2>
        <p className="resultado-automatico">
          Según las notas cargadas: <MateriaBadge estado={evaluacionAutomatica.estado} />
        </p>
        <div className="tick-manual">
          <span className="tick-label">Forzar resultado manualmente:</span>
          <div className="tick-botones">
            <button
              type="button"
              className={materia.tickManual === 'promocion' ? 'tick-boton activo' : 'tick-boton'}
              onClick={() => handleTick('promocion')}
            >
              Promocionó
            </button>
            <button
              type="button"
              className={materia.tickManual === 'firma' ? 'tick-boton activo' : 'tick-boton'}
              onClick={() => handleTick('firma')}
            >
              Firmó
            </button>
          </div>
          {materia.tickManual && (
            <p className="tick-nota">
              Resultado forzado manualmente, aunque las notas cargadas no cumplan la regla automática. Tocá el botón
              de nuevo para volver al cálculo automático.
            </p>
          )}
        </div>
      </section>

      {muestraFinal && (
        <section className="detalle-seccion">
          <h2>Final</h2>
          <InstanciasNotas
            notas={materia.final.notas}
            labels={etiquetasFinal(materia.final.notas.length)}
            resultado={evaluacion.resultadoFinal}
            onChangeNota={actualizarNotaFinal}
          />
        </section>
      )}

      <section className="detalle-seccion">
        <h2>Nota de la materia</h2>
        {muestraNotaMateria ? (
          <div className="nota-materia">
            <input
              type="number"
              min="1"
              max="10"
              step="0.5"
              value={materia.notaMateriaManual ?? notaAutomatica ?? ''}
              onChange={(e) => handleNotaManual(e.target.value)}
            />
            {materia.notaMateriaManual != null && (
              <button type="button" className="btn-reset-nota" onClick={() => handleNotaManual('')}>
                Usar valor calculado ({notaAutomatica ?? '—'})
              </button>
            )}
          </div>
        ) : (
          <p className="page-placeholder">Sin nota / no aplica todavía.</p>
        )}
      </section>

      <section className="detalle-seccion">
        <h2>Nivel</h2>
        <p className="resultado-automatico">
          Según el pool de puntos ({poolBase} pts): <NivelBadge nivel={nivelAutomatico} />
        </p>
        <div className="tick-manual">
          <span className="tick-label">Fijar nivel manualmente:</span>
          <div className="tick-botones">
            {[1, 2, 3].map((nivel) => (
              <button
                key={nivel}
                type="button"
                className={materia.nivelManual === nivel ? 'tick-boton activo' : 'tick-boton'}
                onClick={() => handleNivelManual(nivel)}
              >
                Nivel {nivel}
              </button>
            ))}
          </div>
          {materia.nivelManual != null && (
            <p className="tick-nota">
              Nivel fijado manualmente. Tocá el botón de nuevo para volver al cálculo automático.
            </p>
          )}
        </div>
      </section>
    </section>
  )
}

export default MateriaDetalle
