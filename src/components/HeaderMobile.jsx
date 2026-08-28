import { useState } from 'react'
import { Link } from 'react-router-dom'
import './HeaderMobile.css'

function HeaderMobile({ usuario, carrera, puntos, cerrarSesion }) {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const inicial = usuario.email?.[0]?.toUpperCase() ?? '?'
  // No hay campo de nombre en el perfil (solo email en auth.users), así que
  // se usa la parte antes de la @ como nombre para mostrar en el menú.
  const nombre = usuario.email?.split('@')[0] ?? usuario.email

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
            <span className="header-mobile-moneda" aria-hidden="true" />
            {puntos}
          </span>
        )}
        <button
          type="button"
          className={menuAbierto ? 'header-mobile-avatar activo' : 'header-mobile-avatar'}
          onClick={() => setMenuAbierto((v) => !v)}
        >
          {inicial}
        </button>
      </div>

      {menuAbierto && (
        <>
          <div className="menu-usuario-overlay" onClick={() => setMenuAbierto(false)} />
          <div className="menu-usuario">
            <div className="menu-usuario-cabecera">
              <span className="menu-usuario-avatar" aria-hidden="true">
                {inicial}
              </span>
              <div className="menu-usuario-info">
                <span className="menu-usuario-nombre">{nombre}</span>
                <span className="menu-usuario-email">{usuario.email}</span>
              </div>
            </div>
            <Link to="/cambiar-carrera" className="menu-usuario-fila" onClick={() => setMenuAbierto(false)}>
              <span className="menu-usuario-icono menu-usuario-icono-cuadrado" aria-hidden="true" />
              Cambiar de carrera
            </Link>
            <button type="button" className="menu-usuario-fila menu-usuario-salir" onClick={cerrarSesion}>
              <span className="menu-usuario-icono menu-usuario-icono-circulo" aria-hidden="true" />
              Cerrar sesión
            </button>
          </div>
        </>
      )}
    </header>
  )
}

export default HeaderMobile
