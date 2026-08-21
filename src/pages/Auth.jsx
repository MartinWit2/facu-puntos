import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import './Auth.css'

function Auth() {
  const [modo, setModo] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  const cambiarModo = () => {
    setModo((prev) => (prev === 'login' ? 'signup' : 'login'))
    setError('')
    setMensaje('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email.trim() || !password) {
      setError('Completá el email y la contraseña.')
      return
    }

    setError('')
    setMensaje('')
    setCargando(true)

    if (modo === 'login') {
      const { error: errorLogin } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (errorLogin) setError(errorLogin.message)
    } else {
      const { data, error: errorSignup } = await supabase.auth.signUp({ email: email.trim(), password })
      if (errorSignup) {
        setError(errorSignup.message)
      } else if (!data.session) {
        setMensaje('Te enviamos un email para confirmar la cuenta. Confirmalo y después iniciá sesión.')
        setModo('login')
        setPassword('')
      }
    }

    setCargando(false)
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1>facu_puntos</h1>
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

        <button type="button" className="auth-toggle" onClick={cambiarModo}>
          {modo === 'login' ? '¿No tenés cuenta? Registrate' : '¿Ya tenés cuenta? Iniciá sesión'}
        </button>
      </div>
    </div>
  )
}

export default Auth
