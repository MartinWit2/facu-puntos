import './NivelBadge.css'

function NivelBadge({ nivel }) {
  return <span className={`nivel-badge nivel-badge-${nivel}`}>Nivel {nivel}</span>
}

export default NivelBadge
