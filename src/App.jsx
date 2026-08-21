import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import Auth from './pages/Auth.jsx'
import { useAuth } from './context/useAuth.js'
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
  const { configurado, cargando, session, usuario, cerrarSesion } = useAuth()

  if (!configurado) {
    return (
      <div className="app-shell">
        <div className="app-aviso">
          Falta configurar Supabase: completá <code>VITE_SUPABASE_URL</code> y{' '}
          <code>VITE_SUPABASE_ANON_KEY</code> en el archivo <code>.env</code> (mirá <code>.env.example</code> como
          referencia) y reiniciá <code>npm run dev</code>.
        </div>
      </div>
    )
  }

  if (cargando) {
    return (
      <div className="app-shell">
        <div className="app-aviso">Cargando…</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="app-shell">
        <Auth />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-title">facu_puntos</span>
        <div className="app-header-usuario">
          <span className="app-header-email">{usuario.email}</span>
          <button type="button" className="btn-logout" onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </div>
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
