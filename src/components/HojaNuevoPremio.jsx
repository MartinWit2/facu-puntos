import { useState } from 'react'
import './HojaNuevoPremio.css'

const COSTO_MIN = 10
const COSTO_MAX = 2000
const COSTO_STEP = 10

// Cuerpo de la hoja de nuevo/editar premio (sección "2d" del handoff),
// controlado desde PremiosMobile.jsx igual que HojaEditarMateria: sin
// estado propio salvo el acordeón, todo lo demás vive en el borrador de
// la página. El acordeón + input libre es el mismo patrón de
// ComboboxCategoria (el input manda, elegir del acordeón solo lo setea),
// adaptado para no empujar la hoja: la lista scrollea con su propio alto.
function HojaNuevoPremio({ form, categoriasExistentes, rangoPool, onCambiar }) {
  const [acordeonAbierto, setAcordeonAbierto] = useState(false)

  const elegirCategoria = (categoria) => {
    onCambiar('categoria', categoria)
    setAcordeonAbierto(false)
  }

  const cambiarCosto = (valor) => onCambiar('costoPuntos', Math.max(COSTO_MIN, Math.min(COSTO_MAX, valor)))

  const ayudaCosto = rangoPool
    ? `Tus materias van de ${rangoPool.min} a ${rangoPool.max} pts.`
    : 'Todavía no tenés puntos cargados.'

  return (
    <div className="hoja-premio-form">
      <label className="hoja-premio-campo">
        <span className="hoja-premio-label">Nombre</span>
        <input
          type="text"
          className="hoja-premio-input"
          value={form.nombre}
          onChange={(e) => onCambiar('nombre', e.target.value)}
          placeholder="Salir a comer afuera"
        />
      </label>

      <div className="hoja-premio-campo">
        <span className="hoja-premio-label">Categoría</span>
        <p className="hoja-premio-ayuda-campo">Elegí una o escribí una nueva.</p>

        <div className="hoja-premio-acordeon">
          <button type="button" className="hoja-premio-acordeon-cabecera" onClick={() => setAcordeonAbierto((v) => !v)}>
            <span className={form.categoria ? 'hoja-premio-acordeon-valor' : 'hoja-premio-acordeon-valor vacio'}>
              {form.categoria || 'Elegir categoría'}
            </span>
            <span
              className={acordeonAbierto ? 'hoja-premio-acordeon-chevron abierto' : 'hoja-premio-acordeon-chevron'}
              aria-hidden="true"
            >
              ▾
            </span>
          </button>
          {acordeonAbierto && (
            <div className="hoja-premio-acordeon-lista">
              {categoriasExistentes.length === 0 ? (
                <p className="hoja-premio-acordeon-vacio">Todavía no tenés categorías.</p>
              ) : (
                categoriasExistentes.map((categoria) => {
                  const elegida = categoria === form.categoria
                  return (
                    <button
                      key={categoria}
                      type="button"
                      className={elegida ? 'hoja-premio-acordeon-opcion elegida' : 'hoja-premio-acordeon-opcion'}
                      onClick={() => elegirCategoria(categoria)}
                    >
                      <span
                        className={elegida ? 'hoja-premio-acordeon-circulo activo' : 'hoja-premio-acordeon-circulo'}
                        aria-hidden="true"
                      >
                        {elegida && '✓'}
                      </span>
                      {categoria}
                    </button>
                  )
                })
              )}
            </div>
          )}
        </div>

        <input
          type="text"
          className="hoja-premio-input hoja-premio-categoria-libre"
          value={form.categoria}
          onChange={(e) => onCambiar('categoria', e.target.value)}
          placeholder="O escribí una nueva"
        />
      </div>

      <div className="hoja-premio-campo hoja-premio-costo">
        <div className="hoja-premio-campo-cabecera">
          <span className="hoja-premio-label">Costo en puntos</span>
          <div className="hoja-premio-stepper">
            <button
              type="button"
              onClick={() => cambiarCosto(form.costoPuntos - COSTO_STEP)}
              disabled={form.costoPuntos <= COSTO_MIN}
            >
              −
            </button>
            <span className="hoja-premio-stepper-valor">{form.costoPuntos}</span>
            <button
              type="button"
              onClick={() => cambiarCosto(form.costoPuntos + COSTO_STEP)}
              disabled={form.costoPuntos >= COSTO_MAX}
            >
              +
            </button>
          </div>
        </div>
        <p className="hoja-premio-ayuda">{ayudaCosto}</p>
      </div>
    </div>
  )
}

export default HojaNuevoPremio
