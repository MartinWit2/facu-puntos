import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import { usePerfil } from '../context/usePerfil.js'
import { useMaterias } from '../hooks/useMaterias.js'
import { evaluarCursada } from '../utils/cursada'
import { calcularPuntosTotales } from '../utils/puntosMateria'
import { activarPush, corriendoStandalone, desactivarPush, esIOS, pushSoportado, suscripcionActual } from '../utils/push'
import { calcularReglasEfectivas } from '../utils/reglasMateria'
import { USERNAME_RE } from '../hooks/useAuthFormMobile.js'
import { reproducirSonido, sonidoActivado, setSonidoActivado } from '../utils/sonidos'
import { temaElegido, setTemaElegido } from '../utils/tema'
import './PerfilMobile.css'

function esAprobada(estado) {
  return estado === 'aprobada' || estado === 'promocion'
}

const OPCIONES_TEMA = [
  { valor: 'claro', etiqueta: 'Claro', icono: 'light_mode' },
  { valor: 'oscuro', etiqueta: 'Oscuro', icono: 'dark_mode' },
  { valor: 'automatico', etiqueta: 'Automático', icono: 'brightness_auto' },
]

// Pantalla propia (sección "3b" del rediseño mobile): antes era el menú
// desplegable que se abría tocando el avatar en HeaderMobile.jsx. El
// avatar ahora navega para acá en vez de abrir el dropdown.
function PerfilMobile() {
  const { usuario, cerrarSesion } = useAuth()
  const { perfil, carreras, reglasCarrera, guardarUsername } = usePerfil()
  const { materias, cargando } = useMaterias()
  const [sonido, setSonido] = useState(() => sonidoActivado())
  const [tema, setTema] = useState(() => temaElegido())

  // Nombre de usuario (prompt-32, sección 3): las cuentas sin uno todavía
  // ven acá un campo para cargarlo, y las que ya tienen uno pueden abrir el
  // mismo campo (precargado) para cambiarlo — no es de una sola vez, se
  // puede editar cuando quieran, como cualquier otro dato de perfil.
  const [editandoUsername, setEditandoUsername] = useState(false)
  const [usernameCampo, setUsernameCampo] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [usernameGuardando, setUsernameGuardando] = useState(false)

  const handleAbrirEdicionUsername = () => {
    setUsernameCampo(perfil?.username ?? '')
    setUsernameError('')
    setEditandoUsername(true)
  }

  const handleCancelarEdicionUsername = () => {
    setEditandoUsername(false)
    setUsernameError('')
  }

  const handleGuardarUsername = async () => {
    const valor = usernameCampo.trim()
    if (!USERNAME_RE.test(valor)) {
      setUsernameError('Solo letras, números y guión bajo, sin espacios.')
      return
    }
    setUsernameGuardando(true)
    const { error } = await guardarUsername(valor)
    setUsernameGuardando(false)
    if (error) setUsernameError(error)
    else {
      setUsernameCampo('')
      setUsernameError('')
      setEditandoUsername(false)
    }
  }

  const handleCambiarTema = (valor) => {
    setTema(valor)
    setTemaElegido(valor)
  }

  // Es una preferencia del dispositivo (localStorage), no de la cuenta —
  // no hace falta que se sincronice entre dispositivos. Tocar el switch
  // reproduce el sonido de materia como muestra de cómo va a sonar cuando
  // esté prendido.
  const handleToggleSonido = () => {
    const activado = !sonido
    setSonido(activado)
    setSonidoActivado(activado)
    if (activado) reproducirSonido('materia')
  }

  // Notificaciones push (sección "4.2" del prompt): arranca "cargando"
  // mientras se chequea si ya hay una suscripción activa del navegador, y
  // después queda en uno de cuatro estados. 'no-soportado' e
  // 'ios-no-instalado' son terminales — en esos casos no hay nada que
  // activar, el switch solo explica por qué.
  const [notiEstado, setNotiEstado] = useState('cargando')
  const [notiAviso, setNotiAviso] = useState('')
  const [notiCargando, setNotiCargando] = useState(false)

  useEffect(() => {
    let cancelado = false
    async function chequearEstado() {
      if (esIOS() && !corriendoStandalone()) {
        if (!cancelado) setNotiEstado('ios-no-instalado')
        return
      }
      if (!pushSoportado()) {
        if (!cancelado) setNotiEstado('no-soportado')
        return
      }
      const suscripcion = await suscripcionActual()
      if (!cancelado) setNotiEstado(suscripcion ? 'activo' : 'inactivo')
    }
    chequearEstado()
    return () => {
      cancelado = true
    }
  }, [])

  const handleToggleNotificaciones = async () => {
    if (notiEstado !== 'activo' && notiEstado !== 'inactivo') return
    setNotiAviso('')
    setNotiCargando(true)
    try {
      if (notiEstado === 'activo') {
        await desactivarPush()
        setNotiEstado('inactivo')
      } else {
        const suscripcion = await activarPush(usuario.id)
        if (suscripcion) {
          setNotiEstado('activo')
        } else {
          setNotiAviso('Habilitá los permisos de notificaciones desde la configuración de tu navegador o sistema.')
        }
      }
    } catch (error) {
      console.error(error)
      setNotiAviso('Algo falló activando las notificaciones. Probá de nuevo en un rato.')
    } finally {
      setNotiCargando(false)
    }
  }

  const inicial = (perfil?.username || usuario.email)?.[0]?.toUpperCase() ?? '?'
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
        <span className="perfil-mobile-email">{perfil?.username ?? usuario.email}</span>
        <span className="perfil-mobile-carrera">{nombreCarrera}</span>
      </div>

      {editandoUsername ? (
        <div className="perfil-mobile-username-campo">
          <input
            type="text"
            className="perfil-mobile-username-input"
            placeholder="Elegir nombre de usuario"
            value={usernameCampo}
            onChange={(e) => {
              setUsernameCampo(e.target.value)
              setUsernameError('')
            }}
            autoFocus
          />
          <button
            type="button"
            className="perfil-mobile-username-boton"
            disabled={usernameGuardando || !usernameCampo.trim()}
            onClick={handleGuardarUsername}
          >
            Guardar
          </button>
          <button type="button" className="perfil-mobile-username-cancelar" onClick={handleCancelarEdicionUsername}>
            Cancelar
          </button>
        </div>
      ) : (
        <button type="button" className="perfil-mobile-username-editar" onClick={handleAbrirEdicionUsername}>
          <span className="material-symbols-outlined" aria-hidden="true">
            edit
          </span>
          {perfil?.username ? 'Cambiar nombre de usuario' : 'Elegir nombre de usuario'}
        </button>
      )}
      {usernameError && <p className="perfil-mobile-switch-aviso">{usernameError}</p>}

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

      <span className="seccion-mobile-label">Preferencias</span>
      <div className="perfil-mobile-acciones">
        <button type="button" className="perfil-mobile-switch-fila" onClick={handleToggleSonido}>
          <span className="material-symbols-outlined" aria-hidden="true">
            {sonido ? 'volume_up' : 'volume_off'}
          </span>
          <span className="perfil-mobile-switch-texto">
            <span>Sonido</span>
            <span className="perfil-mobile-switch-ayuda">Al aprobar una materia o canjear un premio.</span>
          </span>
          <span className={sonido ? 'perfil-mobile-switch activo' : 'perfil-mobile-switch'} aria-hidden="true">
            <span className="perfil-mobile-switch-perilla" />
          </span>
        </button>

        <button
          type="button"
          className="perfil-mobile-switch-fila"
          onClick={handleToggleNotificaciones}
          disabled={notiCargando || notiEstado === 'cargando' || notiEstado === 'no-soportado' || notiEstado === 'ios-no-instalado'}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            {notiEstado === 'activo' ? 'notifications_active' : 'notifications_off'}
          </span>
          <span className="perfil-mobile-switch-texto">
            <span>Notificaciones</span>
            <span className="perfil-mobile-switch-ayuda">
              {notiEstado === 'ios-no-instalado'
                ? 'Agregá Unipoints a tu pantalla de inicio para poder activar las notificaciones.'
                : notiEstado === 'no-soportado'
                  ? 'Tu navegador no soporta notificaciones push.'
                  : 'Parciales y finales que se acercan, y notas pendientes de cargar.'}
            </span>
          </span>
          <span className={notiEstado === 'activo' ? 'perfil-mobile-switch activo' : 'perfil-mobile-switch'} aria-hidden="true">
            <span className="perfil-mobile-switch-perilla" />
          </span>
        </button>
        {notiAviso && <p className="perfil-mobile-switch-aviso">{notiAviso}</p>}

        <div className="perfil-mobile-tema-fila">
          <span className="material-symbols-outlined" aria-hidden="true">
            {OPCIONES_TEMA.find((o) => o.valor === tema)?.icono}
          </span>
          <span className="perfil-mobile-switch-texto">
            <span>Tema</span>
            <span className="perfil-mobile-switch-ayuda">Elegí cómo se ve la app en este dispositivo.</span>
          </span>
        </div>
        <div className="perfil-mobile-tema-opciones" role="group" aria-label="Tema">
          {OPCIONES_TEMA.map((opcion) => (
            <button
              key={opcion.valor}
              type="button"
              className={tema === opcion.valor ? 'perfil-mobile-tema-opcion activa' : 'perfil-mobile-tema-opcion'}
              onClick={() => handleCambiarTema(opcion.valor)}
            >
              {opcion.etiqueta}
            </button>
          ))}
        </div>
      </div>

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
