import { useState } from 'react'
import { EMAIL_RE, useAuthForm } from '../hooks/useAuthForm.js'
import './AuthMobile.css'

function AuthMobile() {
  const {
    modo,
    email,
    setEmail,
    password,
    setPassword,
    error,
    mensaje,
    cargando,
    cambiarModo,
    limpiarAviso,
    handleSubmit,
    handleOlvidoContrasena,
  } = useAuthForm()
  const [verPassword, setVerPassword] = useState(false)

  const esLogin = modo === 'login'
  const bajada = esLogin
    ? 'Cargá tus notas, ganá puntos y canjealos por lo que quieras.'
    : 'Armá tu cuenta y elegí tu carrera para empezar.'

  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    limpiarAviso()
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
    limpiarAviso()
  }

  const formularioValido = EMAIL_RE.test(email.trim()) && (esLogin ? password.length > 0 : password.length >= 6)

  return (
    <div className="auth-mobile">
      <div className="auth-mobile-marca">
        <span className="auth-mobile-moneda" aria-hidden="true" />
        <h1 className="auth-mobile-titulo">Unipoints</h1>
        <p className="auth-mobile-bajada">{bajada}</p>
      </div>

      <div className="auth-mobile-switch" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={esLogin}
          className={esLogin ? 'auth-mobile-switch-opcion activa' : 'auth-mobile-switch-opcion'}
          onClick={() => cambiarModo('login')}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!esLogin}
          className={!esLogin ? 'auth-mobile-switch-opcion activa' : 'auth-mobile-switch-opcion'}
          onClick={() => cambiarModo('signup')}
        >
          Registrarme
        </button>
      </div>

      <form className="auth-mobile-form" onSubmit={handleSubmit}>
        <label className="auth-mobile-campo">
          <span className="auth-mobile-label">Email</span>
          <input
            type="email"
            className="auth-mobile-input"
            value={email}
            onChange={handleEmailChange}
            placeholder="tunombre@mail.com"
            autoComplete="email"
          />
        </label>

        <div className="auth-mobile-campo">
          <span className="auth-mobile-label">Contraseña</span>
          <div className="auth-mobile-input-password">
            <input
              type={verPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              placeholder={esLogin ? 'Tu contraseña' : 'Elegí una contraseña'}
              autoComplete={esLogin ? 'current-password' : 'new-password'}
            />
            <button type="button" className="auth-mobile-ver" onClick={() => setVerPassword((v) => !v)}>
              {verPassword ? 'Ocultar' : 'Ver'}
            </button>
          </div>
          {!esLogin && <p className="auth-mobile-ayuda">Mínimo 6 caracteres.</p>}
        </div>

        {esLogin && (
          <button type="button" className="auth-mobile-olvide" onClick={handleOlvidoContrasena}>
            Olvidé mi contraseña
          </button>
        )}

        {(error || mensaje) && (
          <p className={error ? 'auth-mobile-aviso error' : 'auth-mobile-aviso info'}>{error || mensaje}</p>
        )}

        <button type="submit" className="auth-mobile-submit" disabled={cargando || !formularioValido}>
          {cargando ? 'Un momento…' : esLogin ? 'Iniciar sesión' : 'Crear cuenta'}
        </button>
      </form>

      <button
        type="button"
        className="auth-mobile-pie"
        onClick={() => cambiarModo(esLogin ? 'signup' : 'login')}
      >
        {esLogin ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Iniciá sesión'}
      </button>
    </div>
  )
}

export default AuthMobile
