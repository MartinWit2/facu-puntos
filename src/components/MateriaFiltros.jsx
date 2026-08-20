import { useEffect, useState } from 'react'
import { nombreAnio } from '../utils/anio'
import { RANGOS_HORAS } from '../utils/filtrosMaterias'

const OPCIONES_NIVEL = [1, 2, 3].map((n) => ({ valor: String(n), etiqueta: `Nivel ${n}` }))

const OPCIONES_ESTADO = [
  { valor: 'aprobada', etiqueta: 'Aprobada' },
  { valor: 'firmada', etiqueta: 'Firmada' },
  { valor: 'cursando', etiqueta: 'Cursando' },
  { valor: 'pendiente', etiqueta: 'Pendiente' },
]

function FiltroDesplegable({ titulo, opciones, seleccionados, onToggle, abierto, onToggleAbierto }) {
  return (
    <div className="filtro-dropdown">
      <button type="button" className="filtro-summary" onClick={onToggleAbierto} aria-expanded={abierto}>
        {titulo}
        {seleccionados.length > 0 && <span className="filtro-count">{seleccionados.length}</span>}
        <span className="filtro-flecha">{abierto ? '▴' : '▾'}</span>
      </button>
      {abierto && (
        <div className="filtro-opciones-panel">
          {opciones.map(({ valor, etiqueta }) => (
            <label key={valor} className="filtro-opcion">
              <input type="checkbox" checked={seleccionados.includes(valor)} onChange={() => onToggle(valor)} />
              {etiqueta}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

function MateriaFiltros({ materias, filtros, onToggleFiltro, onLimpiar }) {
  const [abiertos, setAbiertos] = useState(() => new Set())

  useEffect(() => {
    // "Afuera" es afuera de CUALQUIER dropdown individual (botón + panel),
    // no solo afuera de toda la barra de filtros: así clickear en el hueco
    // entre filtros, o en "Limpiar filtros", también cierra los abiertos.
    // Clickear el botón de otro filtro sigue sin cerrar los demás, porque
    // ese click cae dentro de SU PROPIO dropdown.
    const handleClickFuera = (e) => {
      if (!e.target.closest('.filtro-dropdown')) {
        setAbiertos(new Set())
      }
    }
    document.addEventListener('mousedown', handleClickFuera)
    return () => document.removeEventListener('mousedown', handleClickFuera)
  }, [])

  const toggleAbierto = (clave) => {
    setAbiertos((prev) => {
      const next = new Set(prev)
      if (next.has(clave)) next.delete(clave)
      else next.add(clave)
      return next
    })
  }

  const opcionesAnio = [...new Set(materias.map((m) => m.anioCursada))]
    .sort((a, b) => a - b)
    .map((anio) => ({ valor: String(anio), etiqueta: `${nombreAnio(anio)} año` }))

  const hayFiltrosActivos = Object.values(filtros).some((lista) => lista.length > 0)

  return (
    <div className="materia-filtros">
      <FiltroDesplegable
        titulo="Año"
        opciones={opcionesAnio}
        seleccionados={filtros.anios}
        onToggle={(valor) => onToggleFiltro('anios', valor)}
        abierto={abiertos.has('anios')}
        onToggleAbierto={() => toggleAbierto('anios')}
      />
      <FiltroDesplegable
        titulo="Horas cátedra"
        opciones={RANGOS_HORAS}
        seleccionados={filtros.rangosHoras}
        onToggle={(valor) => onToggleFiltro('rangosHoras', valor)}
        abierto={abiertos.has('rangosHoras')}
        onToggleAbierto={() => toggleAbierto('rangosHoras')}
      />
      <FiltroDesplegable
        titulo="Nivel"
        opciones={OPCIONES_NIVEL}
        seleccionados={filtros.niveles}
        onToggle={(valor) => onToggleFiltro('niveles', valor)}
        abierto={abiertos.has('niveles')}
        onToggleAbierto={() => toggleAbierto('niveles')}
      />
      <FiltroDesplegable
        titulo="Estado"
        opciones={OPCIONES_ESTADO}
        seleccionados={filtros.estados}
        onToggle={(valor) => onToggleFiltro('estados', valor)}
        abierto={abiertos.has('estados')}
        onToggleAbierto={() => toggleAbierto('estados')}
      />

      {hayFiltrosActivos && (
        <button type="button" className="btn-limpiar-filtros" onClick={onLimpiar}>
          Limpiar filtros
        </button>
      )}
    </div>
  )
}

export default MateriaFiltros
