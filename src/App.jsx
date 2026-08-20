import { NavLink, Route, Routes } from 'react-router-dom'
import './App.css'
import Materias from './pages/Materias.jsx'
import Progreso from './pages/Progreso.jsx'
import Premios from './pages/Premios.jsx'

const NAV_ITEMS = [
  { to: '/', label: 'Materias' },
  { to: '/progreso', label: 'Progreso' },
  { to: '/premios', label: 'Premios' },
]

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-title">facu_puntos</span>
      </header>

      <main className="app-content">
        <Routes>
          <Route path="/" element={<Materias />} />
          <Route path="/progreso" element={<Progreso />} />
          <Route path="/premios" element={<Premios />} />
        </Routes>
      </main>

      <nav className="app-nav">
        {NAV_ITEMS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default App
