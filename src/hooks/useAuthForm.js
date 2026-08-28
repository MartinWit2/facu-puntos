import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Lógica de login/registro compartida entre Auth.jsx (escritorio) y
// AuthMobile.jsx: llamadas a Supabase, validación y mensajes. Cada pantalla
// solo pone su propio layout encima.
export function useAuthForm() {
  const [modo, setModo] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  const limpiarAviso = () => {
    setError('')
    setMensaje('')
  }

  const cambiarModo = (nuevoModo) => {
    setModo(nuevoModo)
    limpiarAviso()
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()

    if (!EMAIL_RE.test(email.trim())) {
      setError('Revisá el email: parece incompleto.')
      return
    }
    if (!password) {
      setError('Poné tu contraseña.')
      return
    }
    if (modo === 'signup' && password.length < 6) {
      setError('La contraseña necesita al menos 6 caracteres.')
      return
    }

    limpiarAviso()
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

  // Único uso nuevo de resetPasswordForEmail en el repo — no toca materias
  // ni puntos, solo dispara el mail de recuperación de Supabase Auth.
  const handleOlvidoContrasena = async () => {
    if (!EMAIL_RE.test(email.trim())) {
      setError('Poné tu email para poder mandarte el mail de recuperación.')
      return
    }

    limpiarAviso()
    const { error: errorReset } = await supabase.auth.resetPasswordForEmail(email.trim())
    if (errorReset) setError(errorReset.message)
    else setMensaje('Te vamos a mandar un mail para recuperarla. Revisá tu casilla.')
  }

  return {
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
  }
}
