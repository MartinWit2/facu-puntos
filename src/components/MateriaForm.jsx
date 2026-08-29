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

  // Carga alternativa de horas cátedra como "horas por clase × cantidad de
  // clases" (útil cuando la fuente del plan de estudio da esos dos números
  // en vez del total). Es puramente una ayuda de carga: nada de esto se
  // guarda, solo calcula el total y lo escribe en form.horasCatedra como si
  // se hubiera tipeado directo.
  const [porClase, setPorClase] = useState(false)
  const [horasPorClase, setHorasPorClase] = useState('')
  const [cantidadClases, setCantidadClases] = useState('')

  const handleChange = (campo) => (e) => {
    const { value } = e.target
    setForm((prev) => ({ ...prev, [campo]: value }))
  }

  const actualizarTotalPorClase = (horasTexto, clasesTexto) => {
    const horas = Number(horasTexto)
    const clases = Number(clasesTexto)
    if (horasTexto === '' || clasesTexto === '' || !Number.isFinite(horas) || horas <= 0) return
    if (!Number.isInteger(clases) || clases < 1) return
    const total = Math.round(horas * clases * 100) / 100
    setForm((prev) => ({ ...prev, horasCatedra: total }))
  }

  const handleHorasPorClaseChange = (e) => {
    const valor = e.target.value
    setHorasPorClase(valor)
    actualizarTotalPorClase(valor, cantidadClases)
  }

  const handleCantidadClasesChange = (e) => {
    const valor = e.target.value
    setCantidadClases(valor)
    actualizarTotalPorClase(horasPorClase, valor)
  }

  const handleTogglePorClase = (e) => {
    const activado = e.target.checked
    setPorClase(activado)
    // Al pasar a "Por clase" no hay forma de "deshacer" un total en sus dos
    // factores: los inputs arrancan vacíos y el total existente queda como
    // estaba hasta que se completen los dos.
    if (activado) {
      setHorasPorClase('')
      setCantidadClases('')
    }
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

      {porClase ? (
        <>
          <label>
            Horas por clase
            <input
              type="number"
              min="0.1"
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
            <p className="horas-por-clase-total">= {form.horasCatedra || 0} hs cátedra</p>
          </div>
        </>
      ) : (
        <label>
          Horas cátedra
          <input type="number" min="1" value={form.horasCatedra} onChange={handleChange('horasCatedra')} placeholder="128" />
        </label>
      )}

      <label className="materia-form-checkbox">
        <input type="checkbox" checked={porClase} onChange={handleTogglePorClase} />
        Cargar como horas por clase × cantidad de clases
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
