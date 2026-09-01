import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import { usePerfil } from '../context/usePerfil.js'
import { useMaterias } from '../hooks/useMaterias.js'
import { evaluarCursada } from '../utils/cursada'
import { calcularPuntosTotales } from '../utils/puntosMateria'
import { calcularReglasEfectivas } from '../utils/reglasMateria'
import './PerfilMobile.css'

function esAprobada(estado) {
  return estado === 'aprobada' || estado === 'promocion'
}

// Pantalla propia (sección "3b" del rediseño mobile): antes era el menú
// desplegable que se abría tocando el avatar en HeaderMobile.jsx. El
// avatar ahora navega para acá en vez de abrir el dropdown.
function PerfilMobile() {
  const { usuario, cerrarSesion } = useAuth()
  const { perfil, carreras, reglasCarrera } = usePerfil()
  const { materias, cargando } = useMaterias()

  const inicial = usuario.email?.[0]?.toUpperCase() ?? '?'
  const carreraActual = carreras.find((c) => c.id === perfil?.carrera_id)
  const nombreCarrera = carreraActual
    ? carreraActual.universidad
      ? `${carreraActual.universidad} · ${carreraActual.nombre}`
      : carreraActual.nombre
    : (perfil?.nombre_custom ?? 'Sin carrera elegida')

  const totalAprobadas = reglasCarrera
    ? materias.filter((m) => esAprobada(evaluarCursada(m, calcularReglasEfectivas(m, reglasCarrera)).estado)).length
    : 0
  const puntosTotales = reglasCarrera ? calcularPuntosTotales(materias, reglasCarrera) : 0

  return (
    <section className="page-mobile perfil-mobile">
      <Link to="/" className="perfil-mobile-volver">
        <span className="material-symbols-outlined" aria-hidden="true">
          arrow_back
        </span>
        Materias
      </Link>

      <div className="perfil-mobile-cabecera">
        <span className="perfil-mobile-avatar" aria-hidden="true">
          {inicial}
        </span>
        <span className="perfil-mobile-email">{usuario.email}</span>
        <span className="perfil-mobile-carrera">{nombreCarrera}</span>
      </div>

      {!cargando && (
        <div className="perfil-mobile-stats">
          <div className="perfil-mobile-stat">
            <span className="material-symbols-outlined" aria-hidden="true">
              school
            </span>
            <span className="perfil-mobile-stat-valor">{totalAprobadas}</span>
            <span className="perfil-mobile-stat-label">Materias aprobadas</span>
          </div>
          <div className="perfil-mobile-stat dorado">
            <span className="material-symbols-outlined relleno" aria-hidden="true">
              stars
            </span>
            <span className="perfil-mobile-stat-valor">{puntosTotales}</span>
            <span className="perfil-mobile-stat-label">Puntos totales</span>
          </div>
        </div>
      )}

      <div className="perfil-mobile-acciones">
        <Link to="/cambiar-carrera" className="perfil-mobile-accion">
          <span className="material-symbols-outlined" aria-hidden="true">
            sync_alt
          </span>
          <span>Cambiar de carrera</span>
          <span className="material-symbols-outlined perfil-mobile-accion-chevron" aria-hidden="true">
            chevron_right
          </span>
        </Link>
        <button type="button" className="perfil-mobile-accion perfil-mobile-salir" onClick={cerrarSesion}>
          <span className="material-symbols-outlined" aria-hidden="true">
            logout
          </span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </section>
  )
}

export default PerfilMobile
