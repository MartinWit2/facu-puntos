import { Link } from 'react-router-dom'
import './HeaderMobile.css'

// El avatar navega a /perfil (pantalla propia, sección "3b" del rediseño)
// en vez de abrir un menú desplegable acá mismo. La inicial sale del
// username si tiene uno cargado (prompt-32, sección 3), igual criterio que
// PerfilMobile.jsx — si no, sigue saliendo del email como siempre.
function HeaderMobile({ usuario, username, carrera, puntos }) {
  const inicial = (username || usuario.email)?.[0]?.toUpperCase() ?? '?'

  return (
    <header className="header-mobile">
      <div className="header-mobile-titulo">
        <span className="header-mobile-app">Unipoints</span>
        {carrera && (
          <span className="header-mobile-carrera">
            {carrera.universidad ? `${carrera.universidad} · ${carrera.nombre}` : carrera.nombre}
          </span>
        )}
      </div>

      <div className="header-mobile-derecha">
        {puntos != null && (
          <span className="header-mobile-saldo">
            <span className="material-symbols-outlined relleno header-mobile-moneda" aria-hidden="true">
              monetization_on
            </span>
            {puntos}
          </span>
        )}
        <Link to="/perfil" className="header-mobile-avatar" aria-label="Tu cuenta">
          {inicial}
        </Link>
      </div>
    </header>
  )
}

export default HeaderMobile
