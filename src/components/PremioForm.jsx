import { useState } from 'react'
import ComboboxCategoria from './ComboboxCategoria.jsx'

const VALORES_INICIALES = {
  nombre: '',
  categoria: '',
  costoPuntos: '',
}

function PremioForm({
  valoresIniciales,
  categoriasExistentes,
  rangoPool,
  onSubmit,
  onCancel,
  submitLabel = 'Agregar premio',
}) {
  const [form, setForm] = useState({ ...VALORES_INICIALES, ...valoresIniciales })
  const [error, setError] = useState('')

  const handleChange = (campo) => (e) => {
    const { value } = e.target
    setForm((prev) => ({ ...prev, [campo]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const nombre = form.nombre.trim()
    const categoria = form.categoria.trim()
    const costoPuntos = Number(form.costoPuntos)

    if (!nombre) {
      setError('Poné un nombre para el premio.')
      return
    }
    if (!categoria) {
      setError('Poné una categoría (puede ser nueva).')
      return
    }
    if (!Number.isFinite(costoPuntos) || costoPuntos <= 0) {
      setError('El costo en puntos tiene que ser mayor a 0.')
      return
    }

    setError('')
    onSubmit({ nombre, categoria, costoPuntos })

    if (!valoresIniciales) {
      setForm(VALORES_INICIALES)
    }
  }

  return (
    <form className="premio-form" onSubmit={handleSubmit}>
      <label>
        Nombre
        <input
          type="text"
          value={form.nombre}
          onChange={handleChange('nombre')}
          placeholder="Salir a comer afuera"
        />
      </label>

      <label>
        Categoría
        <ComboboxCategoria
          value={form.categoria}
          onChange={(valor) => setForm((prev) => ({ ...prev, categoria: valor }))}
          opciones={categoriasExistentes}
        />
      </label>

      <label>
        Costo en puntos
        <input type="number" min="1" value={form.costoPuntos} onChange={handleChange('costoPuntos')} placeholder="80" />
      </label>

      {rangoPool && (
        <div className="premio-rango-referencia">
          Como referencia, tus materias cargadas van de <strong>{rangoPool.min}</strong> a{' '}
          <strong>{rangoPool.max}</strong> pts.
        </div>
      )}

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="submit">{submitLabel}</button>
        {onCancel && (
          <button type="button" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

export default PremioForm
