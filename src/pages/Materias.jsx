import { useState } from 'react'
import MateriaFiltros from '../components/MateriaFiltros.jsx'
import MateriaForm from '../components/MateriaForm.jsx'
import MateriaList from '../components/MateriaList.jsx'
import { usePerfil } from '../context/usePerfil.js'
import { useHorasPorClase } from '../hooks/useHorasPorClase'
import { useMaterias } from '../hooks/useMaterias.js'
import { FILTROS_VACIOS, materiaCoincideFiltros } from '../utils/filtrosMaterias'
import './Materias.css'

// Formulario de carga masiva de horas cátedra (sección "3.1" del handoff):
// vive en su propio componente para que se monte/desmonte junto con la
// selección (igual que MateriaForm remonta con `key` al cambiar de materia)
// y así el modo "por clase" arranque siempre limpio en cada tanda de
// selección, en vez de arrastrar el último valor tipeado de la vez anterior.
function BarraCargaMasiva({ cantidad, aplicando, onAplicar, onCancelar }) {
  const [horasCatedra, setHorasCatedra] = useState('')
  const { porClase, horasPorClase, cantidadClases, handleHorasPorClaseChange, handleCantidadClasesChange, handleTogglePorClase } =
    useHorasPorClase(setHorasCatedra)

  const handleSubmit = (e) => {
    e.preventDefault()
    const horas = Number(horasCatedra)
    if (!Number.isFinite(horas) || horas <= 0) return
    onAplicar(horas)
  }

  const plural = cantidad === 1 ? '' : 's'

  return (
    <div className="materia-form-card">
      <h2>
        {cantidad} materia{plural} seleccionada{plural}
      </h2>
      <form className="materia-form" onSubmit={handleSubmit}>
        {porClase ? (
          <>
            <label>
              Horas por clase
              <input
                type="number"
                min="0"
                step="0.5"
                value={horasPorClase}
                onChange={handleHorasPorClaseChange}
                placeholder="2"
              />
            </label>
            <label>
              Cantidad de clases
              <input type="number" min="1" step="1" value={cantidadClases} onChange={handleCantidadClasesChange} placeholder="34" />
            </label>
            <div className="horas-por-clase-info">
              <p className="horas-por-clase-ayuda">
                Total de clases en todo el período (ej: 2 veces por semana × 17 semanas = 34).
              </p>
              <p className="horas-por-clase-total">= {horasCatedra || 0} hs cátedra</p>
            </div>
          </>
        ) : (
          <label>
            Horas cátedra
            <input
              type="number"
              min="1"
              value={horasCatedra}
              onChange={(e) => setHorasCatedra(e.target.value)}
              placeholder="128"
            />
          </label>
        )}

        <label className="materia-form-checkbox">
          <input type="checkbox" checked={porClase} onChange={handleTogglePorClase} />
          Cargar como horas por clase × cantidad de clases
        </label>

        <div className="form-actions">
          <button type="submit" disabled={aplicando}>
            Aplicar a {cantidad} materia{plural}
          </button>
          <button type="button" onClick={onCancelar}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

function Materias() {
  const { materias, cargando, agregarMateria, editarMateria, eliminarMateria } = useMaterias()
  const { reglasCarrera } = usePerfil()
  const [materiaEditando, setMateriaEditando] = useState(null)
  const [formularioAbierto, setFormularioAbierto] = useState(false)
  const [filtros, setFiltros] = useState(FILTROS_VACIOS)

  // Carga masiva: seleccionar varias materias de la lista y aplicarles la
  // misma carga horaria de una sola vez (útil cuando un catálogo entero
  // tiene la misma cantidad de horas cátedra en varias materias).
  const [modoSeleccion, setModoSeleccion] = useState(false)
  const [seleccionadas, setSeleccionadas] = useState(new Set())
  const [aplicandoMasivo, setAplicandoMasivo] = useState(false)

  const mostrarFormulario = formularioAbierto || materiaEditando !== null

  const handleAgregarClick = () => {
    setMateriaEditando(null)
    setFormularioAbierto(true)
  }

  const handleEditar = (materia) => {
    setMateriaEditando(materia)
    setFormularioAbierto(true)
  }

  const handleCancelar = () => {
    setMateriaEditando(null)
    setFormularioAbierto(false)
  }

  const handleSubmit = (datos) => {
    if (materiaEditando) {
      editarMateria(materiaEditando.id, datos)
    } else {
      agregarMateria(datos)
    }
    setMateriaEditando(null)
    setFormularioAbierto(false)
  }

  const handleEliminar = (id) => {
    if (materiaEditando?.id === id) handleCancelar()
    eliminarMateria(id)
  }

  const handleToggleEmpezada = (materia) => {
    editarMateria(materia.id, { empezada: !materia.empezada })
  }

  const handleToggleFiltro = (categoria, valor) => {
    setFiltros((prev) => {
      const lista = prev[categoria]
      const yaEsta = lista.includes(valor)
      return { ...prev, [categoria]: yaEsta ? lista.filter((v) => v !== valor) : [...lista, valor] }
    })
  }

  const handleLimpiarFiltros = () => setFiltros(FILTROS_VACIOS)

  const handleActivarSeleccion = () => {
    setModoSeleccion(true)
    setSeleccionadas(new Set())
  }

  const handleCancelarSeleccion = () => {
    setModoSeleccion(false)
    setSeleccionadas(new Set())
  }

  const handleToggleSeleccion = (id) => {
    setSeleccionadas((prev) => {
      const siguiente = new Set(prev)
      if (siguiente.has(id)) siguiente.delete(id)
      else siguiente.add(id)
      return siguiente
    })
  }

  const handleAplicarMasivo = async (horas) => {
    setAplicandoMasivo(true)
    await Promise.all([...seleccionadas].map((id) => editarMateria(id, { horasCatedra: horas })))
    setAplicandoMasivo(false)
    handleCancelarSeleccion()
  }

  const materiasFiltradas = materias.filter((materia) => materiaCoincideFiltros(materia, filtros, reglasCarrera))
  const filtrosActivos = filtros.anios.length > 0 || filtros.rangosHoras.length > 0 || filtros.estados.length > 0

  if (cargando) {
    return (
      <section className="page">
        <h1>Materias</h1>
        <p className="page-placeholder">Cargando tus materias…</p>
      </section>
    )
  }

  return (
    <section className="page">
      <h1>Materias</h1>

      {!mostrarFormulario && !modoSeleccion && (
        <div className="materia-acciones-lista">
          <button type="button" className="btn-agregar-materia" onClick={handleAgregarClick}>
            + Agregar materia
          </button>
          <button type="button" className="btn-seleccionar-varias" onClick={handleActivarSeleccion}>
            Seleccionar varias
          </button>
        </div>
      )}

      {modoSeleccion && (
        <button type="button" className="btn-seleccionar-varias" onClick={handleCancelarSeleccion}>
          Cancelar selección
        </button>
      )}

      {seleccionadas.size > 0 && (
        <BarraCargaMasiva
          cantidad={seleccionadas.size}
          aplicando={aplicandoMasivo}
          onAplicar={handleAplicarMasivo}
          onCancelar={handleCancelarSeleccion}
        />
      )}

      {mostrarFormulario && (
        <div className="materia-form-card">
          <h2>{materiaEditando ? `Editar "${materiaEditando.nombre}"` : 'Agregar materia'}</h2>
          <MateriaForm
            key={materiaEditando?.id ?? 'nueva'}
            valoresIniciales={materiaEditando ?? undefined}
            puntosPorHora={reglasCarrera.puntosPorHora}
            submitLabel={materiaEditando ? 'Guardar cambios' : 'Agregar materia'}
            onSubmit={handleSubmit}
            onCancel={handleCancelar}
          />
        </div>
      )}

      {materias.length > 0 && (
        <MateriaFiltros
          materias={materias}
          filtros={filtros}
          onToggleFiltro={handleToggleFiltro}
          onLimpiar={handleLimpiarFiltros}
        />
      )}

      {materias.length > 0 && materiasFiltradas.length === 0 ? (
        <p className="page-placeholder">Ninguna materia coincide con los filtros.</p>
      ) : (
        <MateriaList
          materias={materiasFiltradas}
          reglasCarrera={reglasCarrera}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
          onToggleEmpezada={handleToggleEmpezada}
          filtrosActivos={filtrosActivos}
          modoSeleccion={modoSeleccion}
          seleccionadas={seleccionadas}
          onToggleSeleccion={handleToggleSeleccion}
        />
      )}
    </section>
  )
}

export default Materias
