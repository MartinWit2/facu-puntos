import { NavLink, useLocation } from 'react-router-dom'
import './TabsMobile.css'

// Mismos íconos que el mockup (BottomNavBar): library_books, event,
// leaderboard, workspace_premium — con relleno cuando el tab está activo.
const TABS = [
  { to: '/', label: 'Materias', icono: 'library_books', activo: (p) => p === '/' || p.startsWith('/materias') },
  { to: '/proximos', label: 'Próximos', icono: 'event', activo: (p) => p === '/proximos' },
  { to: '/progreso', label: 'Progreso', icono: 'leaderboard', activo: (p) => p === '/progreso' },
  { to: '/premios', label: 'Premios', icono: 'workspace_premium', activo: (p) => p === '/premios' },
]

function TabsMobile() {
  const { pathname } = useLocation()

  return (
    <nav className="tabs-mobile">
      {TABS.map(({ to, label, icono, activo }) => {
        const esActivo = activo(pathname)
        return (
          <NavLink key={to} to={to} className={'tab-mobile' + (esActivo ? ' activo' : '')}>
            <span className={esActivo ? 'material-symbols-outlined relleno' : 'material-symbols-outlined'} aria-hidden="true">
              {icono}
            </span>
            <span className="tab-mobile-label">{label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}

export default TabsMobile
