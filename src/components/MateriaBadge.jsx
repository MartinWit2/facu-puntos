import './MateriaBadge.css'

const ESTADOS = {
  pendiente: { label: 'Pendiente', clase: 'badge-pendiente' },
  cursando: { label: 'Cursando', clase: 'badge-cursando' },
  promocion: { label: 'Promocionó', clase: 'badge-promocion' },
  firma: { label: 'Firmó (final pendiente)', labelCompacto: 'Firmó', clase: 'badge-firma' },
  recursa: { label: 'Recursa', clase: 'badge-recursa' },
  aprobada: { label: 'Aprobada', clase: 'badge-aprobada' },
}

// `compacto` usa el texto corto donde el espacio es chico (filas mobile);
// en desktop se sigue viendo el texto completo de siempre. `manual`, si se
// pasa, agrega un ícono de mano — indica que el estado viene de un tick
// manual (materia.tickManual) y no de las notas cargadas (solo mobile, el
// ícono no existe si no se importa Material Symbols).
function MateriaBadge({ estado, compacto, manual }) {
  const info = ESTADOS[estado] ?? ESTADOS.cursando
  const label = compacto ? (info.labelCompacto ?? info.label) : info.label
  return (
    <span className={`materia-badge ${info.clase}`}>
      {manual && (
        <span className="material-symbols-outlined materia-badge-manual" aria-hidden="true">
          front_hand
        </span>
      )}
      {label}
    </span>
  )
}

export default MateriaBadge
