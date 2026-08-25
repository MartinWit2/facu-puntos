import { useState } from 'react'
import {
  DEFAULT_CANTIDAD_INSTANCIAS_FINAL,
  DEFAULT_CANTIDAD_PARCIALES,
  DEFAULT_CANTIDAD_RECUPERATORIOS,
} from '../constants'
import { calcularPoolPuntos } from '../utils/puntos'

const VALORES_INICIALES = {
  nombre: '',
  anioCursada: 1,
  horasCatedra: '',
  cantidadParciales: DEFAULT_CANTIDAD_PARCIALES,
  cantidadRecuperatorios: DEFAULT_CANTIDAD_RECUPERATORIOS,
  cantidadInstanciasFinal: DEFAULT_CANTIDAD_INSTANCIAS_FINAL,
  noSumaPuntos: false,
}

function MateriaForm({ valoresIniciales, puntosPorHora, onSubmit, onCancel, submitLabel = 'Agregar materia' }) {
  const [form, setForm] = useState({
    ...VALORES_INICIALES,
    ...valoresIniciales,
    noSumaPuntos: valoresIniciales?.poolOverride === 0,
  })
  const [error, setError] = useState('')

  const handleChange = (campo) => (e) => {
    const { value } = e.target
    setForm((prev) => ({ ...prev, [campo]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const nombre = form.nombre.trim()
    const anioCursada = Number(form.anioCursada)
    const horasCatedra = Number(form.horasCatedra)
    const cantidadParciales = Number(form.cantidadParciales)
    const cantidadRecuperatorios = Number(form.cantidadRecuperatorios)
    const cantidadInstanciasFinal = Number(form.cantidadInstanciasFinal)

    if (!nombre) {
      setError('Poné un nombre para la materia.')
      return
    }
    if (!Number.isInteger(anioCursada) || anioCursada < 1) {
      setError('El año de cursada tiene que ser 1 o más.')
      return
    }
    if (!Number.isFinite(horasCatedra) || horasCatedra <= 0) {
      setError('Las horas cátedra tienen que ser mayores a 0.')
      return
    }
    if (!Number.isInteger(cantidadParciales) || cantidadParciales < 1) {
      setError('Tiene que haber al menos 1 parcial.')
      return
    }
    if (!Number.isInteger(cantidadRecuperatorios) || cantidadRecuperatorios < 0) {
      setError('Los recuperatorios no pueden ser negativos.')
      return
    }
    if (!Number.isInteger(cantidadInstanciasFinal) || cantidadInstanciasFinal < 0) {
      setError('Las instancias de final no pueden ser negativas.')
      return
    }

    setError('')
    onSubmit({
      nombre,
      anioCursada,
      horasCatedra,
      cantidadParciales,
      cantidadRecuperatorios,
      cantidadInstanciasFinal,
      poolOverride: form.noSumaPuntos ? 0 : null,
    })

    if (!valoresIniciales) {
      setForm(VALORES_INICIALES)
    }
  }

  const poolPuntos = calcularPoolPuntos(form.horasCatedra, puntosPorHora)

  return (
    <form className="materia-form" onSubmit={handleSubmit}>
      <label>
        Nombre
        <input type="text" value={form.nombre} onChange={handleChange('nombre')} placeholder="Sistemas Operativos" />
      </label>

      <label>
        Año de cursada
        <input type="number" min="1" value={form.anioCursada} onChange={handleChange('anioCursada')} />
      </label>

      <label>
        Horas cátedra
        <input type="number" min="1" value={form.horasCatedra} onChange={handleChange('horasCatedra')} placeholder="128" />
      </label>

      <label>
        Cantidad de parciales
        <input type="number" min="1" value={form.cantidadParciales} onChange={handleChange('cantidadParciales')} />
      </label>

      <label>
        Recuperatorios por parcial
        <input
          type="number"
          min="0"
          value={form.cantidadRecuperatorios}
          onChange={handleChange('cantidadRecuperatorios')}
        />
      </label>

      <label>
        Instancias de final
        <input
          type="number"
          min="0"
          value={form.cantidadInstanciasFinal}
          onChange={handleChange('cantidadInstanciasFinal')}
        />
      </label>

      <label className="materia-form-checkbox">
        <input
          type="checkbox"
          checked={form.noSumaPuntos}
          onChange={(e) => setForm((prev) => ({ ...prev, noSumaPuntos: e.target.checked }))}
        />
        No sumar puntos de esta materia (ya la tenía aprobada antes de usar la app)
      </label>

      <div className="pool-preview">
        {form.noSumaPuntos ? (
          <span>Esta materia no va a sumar puntos.</span>
        ) : (
          <>
            Pool de puntos base: <strong>{poolPuntos}</strong>{' '}
            <span>
              ({puntosPorHora} punto{puntosPorHora === 1 ? '' : 's'} por hora cátedra)
            </span>
          </>
        )}
      </div>

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

export default MateriaForm
