import { useState } from 'react'
import {
  DEFAULT_NOTA_APROBACION,
  DEFAULT_NOTA_PROMOCION,
  DEFAULT_PERMITE_PROMOCION,
  DEFAULT_PUNTOS_POR_HORA,
} from '../constants'

const VALORES_INICIALES = {
  nombre: '',
  notaAprobacion: DEFAULT_NOTA_APROBACION,
  notaPromocion: DEFAULT_NOTA_PROMOCION,
  permitePromocion: DEFAULT_PERMITE_PROMOCION,
  puntosPorHora: DEFAULT_PUNTOS_POR_HORA,
}

// Formulario para armar una carrera propia (ver SeleccionCarrera.jsx y
// CambiarCarrera.jsx): un nombre a elección, más los mismos cuatro valores
// que trae una fila de `carreras`, precargados con los mismos defaults de
// la base (6, 8, sí, 1), pero cargados a mano y guardados en el perfil.
function FormReglasPropias({ onSubmit, onCancel, submitLabel = 'Continuar', disabled }) {
  const [form, setForm] = useState(VALORES_INICIALES)

  const nombreListo = form.nombre.trim().length > 0

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!nombreListo) return
    onSubmit({
      nombre: form.nombre.trim(),
      notaAprobacion: Number(form.notaAprobacion),
      notaPromocion: Number(form.notaPromocion),
      permitePromocion: form.permitePromocion,
      puntosPorHora: Number(form.puntosPorHora),
    })
  }

  return (
    <form className="reglas-propias-form" onSubmit={handleSubmit}>
      <label>
        Nombre
        <input
          type="text"
          placeholder="Cómo querés llamarla"
          value={form.nombre}
          onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
        />
      </label>

      <label>
        Nota de aprobación
        <input
          type="number"
          min="1"
          max="10"
          value={form.notaAprobacion}
          onChange={(e) => setForm((prev) => ({ ...prev, notaAprobacion: e.target.value }))}
        />
      </label>

      <label className="reglas-propias-checkbox">
        <input
          type="checkbox"
          checked={form.permitePromocion}
          onChange={(e) => setForm((prev) => ({ ...prev, permitePromocion: e.target.checked }))}
        />
        Permite promoción sin final
      </label>

      {form.permitePromocion && (
        <label>
          Nota de promoción
          <input
            type="number"
            min="1"
            max="10"
            value={form.notaPromocion}
            onChange={(e) => setForm((prev) => ({ ...prev, notaPromocion: e.target.value }))}
          />
        </label>
      )}

      <label>
        Puntos por hora cátedra
        <input
          type="number"
          min="0.1"
          step="0.1"
          value={form.puntosPorHora}
          onChange={(e) => setForm((prev) => ({ ...prev, puntosPorHora: e.target.value }))}
        />
      </label>

      <div className="reglas-propias-actions">
        <button type="submit" disabled={disabled || !nombreListo}>
          {nombreListo ? submitLabel : 'Ponele un nombre'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={disabled}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

export default FormReglasPropias
