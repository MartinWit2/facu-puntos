import { useState } from 'react'
import MateriaFiltros from '../components/MateriaFiltros.jsx'
import MateriaForm from '../components/MateriaForm.jsx'
import MateriaList from '../components/MateriaList.jsx'
import { useMaterias } from '../hooks/useMaterias.js'
import { FILTROS_VACIOS, materiaCoincideFiltros } from '../utils/filtrosMaterias'
import './Materias.css'

function Materias() {
  const { materias, agregarMateria, editarMateria, eliminarMateria } = useMaterias()
  const [materiaEditando, setMateriaEditando] = useState(null)
  const [formularioAbierto, setFormularioAbierto] = useState(false)
  const [filtros, setFiltros] = useState(FILTROS_VACIOS)

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

  const handleToggleFiltro = (categoria, valor) => {
    setFiltros((prev) => {
      const lista = prev[categoria]
      const yaEsta = lista.includes(valor)
      return { ...prev, [categoria]: yaEsta ? lista.filter((v) => v !== valor) : [...lista, valor] }
    })
  }

  const handleLimpiarFiltros = () => setFiltros(FILTROS_VACIOS)

  const materiasFiltradas = materias.filter((materia) => materiaCoincideFiltros(materia, filtros))

  return (
    <section className="page">
      <h1>Materias</h1>

      {!mostrarFormulario && (
        <button type="button" className="btn-agregar-materia" onClick={handleAgregarClick}>
          + Agregar materia
        </button>
      )}

      {mostrarFormulario && (
        <div className="materia-form-card">
          <h2>{materiaEditando ? `Editar "${materiaEditando.nombre}"` : 'Agregar materia'}</h2>
          <MateriaForm
            key={materiaEditando?.id ?? 'nueva'}
            valoresIniciales={materiaEditando ?? undefined}
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
        <MateriaList materias={materiasFiltradas} onEditar={handleEditar} onEliminar={handleEliminar} />
      )}
    </section>
  )
}

export default Materias
