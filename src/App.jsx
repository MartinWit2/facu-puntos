import { useEffect } from 'react'
import { Link, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Auth from './pages/Auth.jsx'
import AuthMobile from './pages/AuthMobile.jsx'
import SeleccionCarrera from './pages/SeleccionCarrera.jsx'
import CarreraMobile from './pages/CarreraMobile.jsx'
import { useAuth } from './context/useAuth.js'
import { usePerfil } from './context/usePerfil.js'
import { useMaterias, invalidarCacheMaterias } from './hooks/useMaterias.js'
import { useCanjes, invalidarCacheCanjes } from './hooks/useCanjes.js'
import { invalidarCachePremios } from './hooks/usePremios.js'
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
import MateriaDetalleMobile from './pages/MateriaDetalleMobile.jsx'
import ProximosMobile from './pages/ProximosMobile.jsx'
import Progreso from './pages/Progreso.jsx'
import ProgresoMobile from './pages/ProgresoMobile.jsx'
import Premios from './pages/Premios.jsx'
import PremiosMobile from './pages/PremiosMobile.jsx'
import HistorialCanjesMobile from './pages/HistorialCanjesMobile.jsx'
import PerfilMobile from './pages/PerfilMobile.jsx'

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
  const navigate = useNavigate()
  const { configurado, cargando, session, usuario, cerrarSesion } = useAuth()

  // Fallback del click en una notificación push (ver public/sw.js): cuando
  // el navegador no soporta WindowClient.navigate(), el Service Worker
  // manda un postMessage en vez de navegar él mismo, y acá se completa con
  // React Router — así no hace falta una recarga dura de la SPA.
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const handleMensaje = (event) => {
      if (event.data?.type === 'navegar' && event.data.url) navigate(event.data.url)
    }
    navigator.serviceWorker.addEventListener('message', handleMensaje)
    return () => navigator.serviceWorker.removeEventListener('message', handleMensaje)
  }, [navigate])
  const { perfil, carreras, cargandoPerfil, carreraElegida, cargandoReglasCarrera, reglasCarrera } = usePerfil()
  const { materias, cargando: cargandoMaterias } = useMaterias()
  const { canjes, cargando: cargandoCanjes } = useCanjes()
  const esMobil = useEsMobil()

  // Refresca las cachés compartidas (materias/canjes/premios) cada vez que
  // la app vuelve a primer plano después de estar oculta un rato (prompt-32,
  // sección 2) — con un umbral chico para no volver a pedir todo si el
  // usuario solo cambió de pestaña un instante. Esto es una salvaguarda
  // extra: el bug puntual de saldo negativo ya se resuelve con el gate de
  // `cargandoMaterias`/`cargandoCanjes` de abajo, pero esto además evita que
  // los datos queden viejos si la PWA pasa mucho tiempo sin cerrarse del todo.
  useEffect(() => {
    let ultimoRefresco = Date.now()
    const UMBRAL_MS = 60 * 1000

    const handleVisibilidad = () => {
      if (document.visibilityState !== 'visible') return
      const ahora = Date.now()
      if (ahora - ultimoRefresco < UMBRAL_MS) return
      ultimoRefresco = ahora
      invalidarCacheMaterias()
      invalidarCacheCanjes()
      invalidarCachePremios()
    }

    document.addEventListener('visibilitychange', handleVisibilidad)
    window.addEventListener('pageshow', handleVisibilidad)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilidad)
      window.removeEventListener('pageshow', handleVisibilidad)
    }
  }, [])

  // Nunca se muestra un saldo calculado con datos a medio cargar (prompt-32,
  // sección 2 — bug del saldo negativo momentáneo): mientras materias o
  // canjes todavía están pidiéndose, puntosHeader queda en null, y
  // HeaderMobile/CabeceraApp ya saben ocultar la píldora de puntos cuando es
  // null en vez de mostrar un 0 o un negativo transitorio.
  const puntosHeader =
    reglasCarrera && !cargandoMaterias && !cargandoCanjes
      ? calcularSaldoDisponible(calcularPuntosTotales(materias, reglasCarrera), canjesDesde(canjes, perfil?.carrera_desde))
      : null
  // Si no hay carrera_id pero el perfil ya tiene una carrera propia armada
  // (ver CarreraMobile/SeleccionCarrera/CambiarCarrera), se arma un objeto
  // liviano solo con el nombre para que el header lo muestre igual que a
  // cualquier carrera real, sin universidad.
  const carreraActual =
    carreras.find((carrera) => carrera.id === perfil?.carrera_id) ??
    (perfil?.nombre_custom ? { nombre: perfil.nombre_custom, universidad: null } : undefined)

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
    if (esMobil) return <AuthMobile />
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
    if (esMobil) return <CarreraMobile />
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
        <HeaderMobile usuario={usuario} username={perfil?.username} carrera={carreraActual} puntos={puntosHeader} />

        <main className="app-content-mobile">
          <Routes>
            <Route path="/" element={<MateriasMobile />} />
            <Route path="/materias/:id" element={<MateriaDetalleMobile />} />
            <Route path="/proximos" element={<ProximosMobile />} />
            <Route path="/progreso" element={<ProgresoMobile />} />
            <Route path="/premios" element={<PremiosMobile />} />
            <Route path="/historial-canjes" element={<HistorialCanjesMobile />} />
            <Route path="/perfil" element={<PerfilMobile />} />
            <Route path="/cambiar-carrera" element={<CarreraMobile />} />
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
