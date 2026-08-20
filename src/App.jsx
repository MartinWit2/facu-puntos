import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import Materias from './pages/Materias.jsx'
import MateriaDetalle from './pages/MateriaDetalle.jsx'
import Progreso from './pages/Progreso.jsx'
import Premios from './pages/Premios.jsx'

const NAV_ITEMS = [
  { to: '/', label: 'Materias' },
  { to: '/progreso', label: 'Progreso' },
  { to: '/premios', label: 'Premios' },
]

function App() {
  const { pathname } = useLocation()

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-title">facu_puntos</span>
      </header>

      <main className="app-content">
        <Routes>
          <Route path="/" element={<Materias />} />
          <Route path="/materias/:id" element={<MateriaDetalle />} />
          <Route path="/progreso" element={<Progreso />} />
          <Route path="/premios" element={<Premios />} />
        </Routes>
      </main>

      <nav className="app-nav">
        {NAV_ITEMS.map(({ to, label }) => {
          const activo = to === '/' ? pathname === '/' || pathname.startsWith('/materias') : pathname === to
          return (
            <NavLink key={to} to={to} className={'nav-link' + (activo ? ' active' : '')}>
              {label}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}

export default App
