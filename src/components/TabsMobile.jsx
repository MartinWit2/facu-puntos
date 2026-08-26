import { NavLink, useLocation } from 'react-router-dom'
import './TabsMobile.css'

const TABS = [
  { to: '/', label: 'Materias', activo: (p) => p === '/' || p.startsWith('/materias') },
  { to: '/progreso', label: 'Progreso', activo: (p) => p === '/progreso' },
  { to: '/premios', label: 'Premios', activo: (p) => p === '/premios' },
]

function TabsMobile() {
  const { pathname } = useLocation()

  return (
    <nav className="tabs-mobile">
      {TABS.map(({ to, label, activo }) => (
        <NavLink key={to} to={to} className={'tab-mobile' + (activo(pathname) ? ' activo' : '')}>
          <span className={`tab-mobile-icono tab-mobile-icono-${label.toLowerCase()}`} aria-hidden="true" />
          <span className="tab-mobile-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default TabsMobile
