import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import Auth from './pages/Auth.jsx'
import SeleccionCarrera from './pages/SeleccionCarrera.jsx'
import { useAuth } from './context/useAuth.js'
import { usePerfil } from './context/usePerfil.js'
import { useMaterias } from './hooks/useMaterias.js'
import { useCanjes } from './hooks/useCanjes.js'
import { useEsMobil } from './hooks/useEsMobil.js'
import { calcularSaldoDisponible, canjesDesde } from './utils/canjes'
import { calcularPuntosTotales } from './utils/puntosMateria'
import HeaderMobile from './components/HeaderMobile.jsx'
import TabsMobile from './components/TabsMobile.jsx'
import './App.css'
import CambiarCarrera from './pages/CambiarCarrera.jsx'
import Materias from './pages/Materias.jsx'
import MateriasMobile from './pages/MateriasMobile.jsx'
import MateriaDetalle from './pages/MateriaDetalle.jsx'
import Progreso from './pages/Progreso.jsx'
import Premios from './pages/Premios.jsx'

const NAV_ITEMS = [
  { to: '/', label: 'Materias' },
  { to: '/progreso', label: 'Progreso' },
  { to: '/premios', label: 'Premios' },
]

function CabeceraApp({ usuario, cerrarSesion, mostrarCambiarCarrera, puntos }) {
  return (
    <header className="app-header">
      <span className="app-title">Unipoints</span>
      <div className="app-header-usuario">
        {puntos != null && (
          <span className="app-header-puntos">
            <span aria-hidden="true">🪙</span> {puntos}
          </span>
        )}
        <span className="app-header-email">{usuario.email}</span>
        {mostrarCambiarCarrera && (
          <Link to="/cambiar-carrera" className="btn-cambiar-carrera">
            Cambiar de carrera
          </Link>
        )}
        <button type="button" className="btn-logout" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}

function App() {
  const { pathname } = useLocation()
  const { configurado, cargando, session, usuario, cerrarSesion } = useAuth()
  const { perfil, carreras, cargandoPerfil, carreraElegida, cargandoReglasCarrera, reglasCarrera } = usePerfil()
  const { materias } = useMaterias()
  const { canjes } = useCanjes()
  const esMobil = useEsMobil()

  const puntosHeader = reglasCarrera
    ? calcularSaldoDisponible(calcularPuntosTotales(materias, reglasCarrera), canjesDesde(canjes, perfil?.carrera_desde))
    : null
  const carreraActual = carreras.find((carrera) => carrera.id === perfil?.carrera_id)

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

  if (cargandoPerfil) {
    return (
      <div className="app-shell">
        <div className="app-aviso">Cargando tu perfil…</div>
      </div>
    )
  }

  if (!carreraElegida) {
    return (
      <div className="app-shell">
        <CabeceraApp usuario={usuario} cerrarSesion={cerrarSesion} />
        <SeleccionCarrera />
      </div>
    )
  }

  if (cargandoReglasCarrera) {
    return (
      <div className="app-shell">
        <div className="app-aviso">Cargando tu carrera…</div>
      </div>
    )
  }

  if (esMobil) {
    return (
      <div className="app-shell-mobile">
        <HeaderMobile usuario={usuario} carrera={carreraActual} puntos={puntosHeader} cerrarSesion={cerrarSesion} />

        <main className="app-content-mobile">
          <Routes>
            <Route path="/" element={<MateriasMobile />} />
            {/* Detalle/Progreso/Premios/Cambiar de carrera todavía usan la
                versión de escritorio: el rediseño mobile avanza pantalla por
                pantalla y estas siguen sin handoff propio. */}
            <Route path="/materias/:id" element={<MateriaDetalle />} />
            <Route path="/progreso" element={<Progreso />} />
            <Route path="/premios" element={<Premios />} />
            <Route path="/cambiar-carrera" element={<CambiarCarrera />} />
          </Routes>
        </main>

        <TabsMobile />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <CabeceraApp usuario={usuario} cerrarSesion={cerrarSesion} mostrarCambiarCarrera puntos={puntosHeader} />

      <main className="app-content">
        <Routes>
          <Route path="/" element={<Materias />} />
          <Route path="/materias/:id" element={<MateriaDetalle />} />
          <Route path="/progreso" element={<Progreso />} />
          <Route path="/premios" element={<Premios />} />
          <Route path="/cambiar-carrera" element={<CambiarCarrera />} />
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
