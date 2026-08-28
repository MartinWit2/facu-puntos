import { useAuthForm } from '../hooks/useAuthForm.js'
import './Auth.css'

function Auth() {
  const { modo, email, setEmail, password, setPassword, error, mensaje, cargando, cambiarModo, handleSubmit } =
    useAuthForm()

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1>Unipoints</h1>
        <p className="auth-subtitulo">{modo === 'login' ? 'Iniciá sesión' : 'Creá tu cuenta'}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
            />
          </label>

          {error && <p className="auth-error">{error}</p>}
          {mensaje && <p className="auth-mensaje">{mensaje}</p>}

          <button type="submit" disabled={cargando}>
            {cargando ? 'Un momento…' : modo === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </form>

        <button
          type="button"
          className="auth-toggle"
          onClick={() => cambiarModo(modo === 'login' ? 'signup' : 'login')}
        >
          {modo === 'login' ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Iniciá sesión'}
        </button>
      </div>
    </div>
  )
}

export default Auth
