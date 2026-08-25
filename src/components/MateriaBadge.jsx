import './MateriaBadge.css'

const ESTADOS = {
  pendiente: { label: 'Pendiente', clase: 'badge-pendiente' },
  cursando: { label: 'Cursando', clase: 'badge-cursando' },
  promocion: { label: 'Promocionó', clase: 'badge-promocion' },
  firma: { label: 'Firmó (final pendiente)', clase: 'badge-firma' },
  recursa: { label: 'Recursa', clase: 'badge-recursa' },
  aprobada: { label: 'Aprobada', clase: 'badge-aprobada' },
}

function MateriaBadge({ estado }) {
  const info = ESTADOS[estado] ?? ESTADOS.cursando
  return <span className={`materia-badge ${info.clase}`}>{info.label}</span>
}

export default MateriaBadge
