import { useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCelebracion } from '../components/Celebracion.jsx'
import MateriaBadge from '../components/MateriaBadge.jsx'
import { usePerfil } from '../context/usePerfil.js'
import { useMaterias } from '../hooks/useMaterias.js'
import { nombreAnio } from '../utils/anio'
import { calcularNotaMateriaAutomatica, contarInstanciasVisibles, evaluarCursada } from '../utils/cursada'
import { calcularPoolPuntos } from '../utils/puntos'
import { calcularReglasEfectivas } from '../utils/reglasMateria'
import './MateriaDetalle.css'

const ESTADOS_FESTEJABLES = new Set(['promocion', 'firma'])

function etiquetasParcial(cantidadInstancias) {
  return Array.from({ length: cantidadInstancias }, (_, i) => (i === 0 ? 'Nota original' : `Recuperatorio ${i}`))
}

function etiquetasFinal(cantidadInstancias) {
  return Array.from({ length: cantidadInstancias }, (_, i) => `Instancia ${i + 1}`)
}

function InstanciasNotas({ notas, labels, resultado, reglas, onChangeNota }) {
  const visibles = contarInstanciasVisibles(notas, reglas)

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
        <span className="instancia-resultado fail">No llegó a {reglas.notaAprobacion} en ninguna instancia</span>
      )}
    </div>
  )
}

function MateriaDetalle() {
  const { id } = useParams()
  const { materias, cargando, editarMateria } = useMaterias()
  const { reglasCarrera } = usePerfil()
  const materia = materias.find((m) => m.id === id)

  const { celebrar, elemento: celebracion } = useCelebracion()

  const reglas = materia && reglasCarrera ? calcularReglasEfectivas(materia, reglasCarrera) : null
  const evaluacion = reglas ? evaluarCursada(materia, reglas) : null

  // Festeja el instante en que la materia PASA a promocionó/firmó (por nota
  // o por tick manual), no cada vez que la pantalla se abre ya estando así.
  const estadoAnteriorRef = useRef(evaluacion?.estado)
  useEffect(() => {
    const anterior = estadoAnteriorRef.current
    if (evaluacion && anterior !== evaluacion.estado && ESTADOS_FESTEJABLES.has(evaluacion.estado)) {
      celebrar()
    }
    estadoAnteriorRef.current = evaluacion?.estado
  }, [evaluacion, celebrar])

  if (cargando) {
    return (
      <section className="page">
        <p className="page-placeholder">Cargando…</p>
      </section>
    )
  }

  if (!materia) {
    return (
      <section className="page">
        <p className="page-placeholder">No encontramos esa materia.</p>
        <Link to="/">← Volver a Materias</Link>
      </section>
    )
  }

  const evaluacionAutomatica = evaluarCursada({ ...materia, tickManual: null }, reglas)
  const notaAutomatica = calcularNotaMateriaAutomatica(evaluacion)
  const muestraNotaMateria = evaluacion.estado === 'promocion' || evaluacion.estado === 'aprobada'
  const muestraFinal = evaluacion.resultadoFinal !== null
  const faltanHoras = materia.horasCatedra == null
  const poolBase = calcularPoolPuntos(materia.horasCatedra, reglas.puntosPorHora)

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

  const handleToggleEmpezada = () => {
    editarMateria(materia.id, { empezada: !materia.empezada })
  }

  const handleNotaManual = (valor) => {
    editarMateria(materia.id, { notaMateriaManual: valor === '' ? null : Number(valor) })
  }

  const handleOverrideNumero = (campo, valor) => {
    editarMateria(materia.id, { [campo]: valor === '' ? null : Number(valor) })
  }

  const handlePermitePromocionOverride = (valor) => {
    editarMateria(materia.id, {
      permitePromocionOverride: materia.permitePromocionOverride === valor ? null : valor,
    })
  }

  const handlePromocionPorPromedioOverride = (valor) => {
    editarMateria(materia.id, {
      promocionPorPromedioOverride: materia.promocionPorPromedioOverride === valor ? null : valor,
    })
  }

  return (
    <section className="page materia-detalle">
      {celebracion}
      <Link to="/" className="volver-link">
        ← Volver a Materias
      </Link>

      <div className="detalle-header">
        <h1>{materia.nombre}</h1>
        <MateriaBadge estado={evaluacion.estado} />
        {evaluacion.estado === 'pendiente' && (
          <button type="button" className="btn-toggle-empezada" onClick={handleToggleEmpezada}>
            Empezar a cursar
          </button>
        )}
        {evaluacion.estado === 'cursando' && (
          <button type="button" className="btn-toggle-empezada" onClick={handleToggleEmpezada}>
            Volver a pendiente
          </button>
        )}
      </div>
      <p className="detalle-meta">
        {nombreAnio(materia.anioCursada)} año ·{' '}
        {faltanHoras ? (
          <span className="materia-aviso">Cargá las horas cátedra de esta materia</span>
        ) : (
          <>
            {materia.horasCatedra} hs cátedra · pool base {poolBase} pts
          </>
        )}
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
                reglas={reglas}
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
            reglas={reglas}
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
        <h2>Reglas de esta materia</h2>
        <p className="resultado-automatico">
          Por default (según tu carrera): aprobás con <strong>{reglasCarrera.notaAprobacion}+</strong>, promocionás
          con <strong>{reglasCarrera.notaPromocion}+</strong>, {reglasCarrera.permitePromocion ? '' : 'no '}permite
          promoción.
        </p>
        <div className="reglas-overrides">
          <label>
            Nota para aprobar (override)
            <input
              type="number"
              min="1"
              max="10"
              step="0.5"
              placeholder={String(reglasCarrera.notaAprobacion)}
              value={materia.notaAprobacionOverride ?? ''}
              onChange={(e) => handleOverrideNumero('notaAprobacionOverride', e.target.value)}
            />
          </label>
          <label>
            Nota para promocionar (override)
            <input
              type="number"
              min="1"
              max="10"
              step="0.5"
              placeholder={String(reglasCarrera.notaPromocion)}
              value={materia.notaPromocionOverride ?? ''}
              onChange={(e) => handleOverrideNumero('notaPromocionOverride', e.target.value)}
            />
          </label>
          <div className="override-promocion-por-promedio">
            <span className="tick-label">Promoción por promedio (override)</span>
            <div className="tick-botones">
              <button
                type="button"
                className={materia.promocionPorPromedioOverride === true ? 'tick-boton activo' : 'tick-boton'}
                onClick={() => handlePromocionPorPromedioOverride(true)}
              >
                Sí
              </button>
              <button
                type="button"
                className={materia.promocionPorPromedioOverride === false ? 'tick-boton activo' : 'tick-boton'}
                onClick={() => handlePromocionPorPromedioOverride(false)}
              >
                No
              </button>
            </div>
          </div>
          <div className="override-permite-promocion">
            <span className="tick-label">Permite promoción (override)</span>
            <div className="tick-botones">
              <button
                type="button"
                className={materia.permitePromocionOverride === true ? 'tick-boton activo' : 'tick-boton'}
                onClick={() => handlePermitePromocionOverride(true)}
              >
                Sí
              </button>
              <button
                type="button"
                className={materia.permitePromocionOverride === false ? 'tick-boton activo' : 'tick-boton'}
                onClick={() => handlePermitePromocionOverride(false)}
              >
                No
              </button>
            </div>
          </div>
        </div>
      </section>
    </section>
  )
}

export default MateriaDetalle
