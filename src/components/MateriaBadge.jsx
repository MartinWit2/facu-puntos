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
// en desktop se sigue viendo el texto completo de siempre.
function MateriaBadge({ estado, compacto }) {
  const info = ESTADOS[estado] ?? ESTADOS.cursando
  const label = compacto ? (info.labelCompacto ?? info.label) : info.label
  return <span className={`materia-badge ${info.clase}`}>{label}</span>
}

export default MateriaBadge
