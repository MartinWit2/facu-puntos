import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { EMAIL_RE } from './useAuthForm.js'

// Letras, números y guión bajo, sin espacios — mismo criterio para el que
// se ve del lado del servidor (la Edge Function no valida formato, confía
// en que ya pasó por acá; la unicidad la garantiza el índice único de la base).
export const USERNAME_RE = /^[a-zA-Z0-9_]+$/

// Fork de useAuthForm.js SOLO para AuthMobile.jsx (prompt-32, sección 3):
// login con email O nombre de usuario, y username opcional al registrarse.
// No se tocó useAuthForm.js porque Auth.jsx (escritorio) lo sigue usando tal
// cual — este hook es una copia adaptada, no una versión compartida, a
// propósito, para no arriesgar ningún cambio de comportamiento en escritorio.
export function useAuthFormMobile() {
  const [modo, setModo] = useState('login')
  const [identificador, setIdentificador] = useState('') // login: email o username
  const [email, setEmail] = useState('') // signup: siempre email real
  const [username, setUsername] = useState('') // signup: opcional
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

  const handleLogin = async () => {
    const { data, error: errorFn } = await supabase.functions.invoke('login-con-usuario', {
      body: { identificador: identificador.trim(), password },
    })

    if (errorFn) {
      setError('No pudimos iniciar sesión. Probá de nuevo en un rato.')
      return
    }
    if (data?.error) {
      setError(data.error)
      return
    }

    const { error: errorSesion } = await supabase.auth.setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    })
    if (errorSesion) setError(errorSesion.message)
  }

  const handleSignup = async () => {
    const { data, error: errorSignup } = await supabase.auth.signUp({ email: email.trim(), password })
    if (errorSignup) {
      setError(errorSignup.message)
      return
    }

    if (!data.session) {
      setMensaje('Te enviamos un email para confirmar la cuenta. Confirmalo y después iniciá sesión.')
      setModo('login')
      setPassword('')
      return
    }

    // Con sesión ya armada (confirmación de email desactivada) se puede
    // guardar el username de una — si no hay sesión todavía (rama de
    // arriba), no hay con qué autenticar el upsert, así que directamente no
    // se ofrece acá: la persona lo carga después desde Perfil ya logueada.
    if (username.trim()) {
      const { error: errorUsername } = await supabase
        .from('perfiles')
        .upsert({ user_id: data.session.user.id, username: username.trim() }, { onConflict: 'user_id' })
      if (errorUsername) {
        setMensaje(
          errorUsername.code === '23505'
            ? 'Cuenta creada. Ese nombre de usuario ya está tomado — podés elegir otro después desde Perfil.'
            : 'Cuenta creada. No se pudo guardar el nombre de usuario — podés cargarlo después desde Perfil.',
        )
      }
    }
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()

    if (modo === 'login') {
      if (!identificador.trim()) {
        setError('Poné tu email o nombre de usuario.')
        return
      }
    } else if (!EMAIL_RE.test(email.trim())) {
      setError('Revisá el email: parece incompleto.')
      return
    } else if (username.trim() && !USERNAME_RE.test(username.trim())) {
      setError('El nombre de usuario solo puede tener letras, números y guión bajo, sin espacios.')
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

    if (modo === 'login') await handleLogin()
    else await handleSignup()

    setCargando(false)
  }

  // Único uso de resetPasswordForEmail acá — necesita un email real, no
  // sirve con username (no tenemos forma segura de resolverlo del lado del
  // cliente, y tampoco hace falta: Supabase ya no manda nada si el email no
  // existe, así que no hay nada que filtrar).
  const handleOlvidoContrasena = async () => {
    if (!EMAIL_RE.test(identificador.trim())) {
      setError('Poné tu email (no el nombre de usuario) para mandarte el mail de recuperación.')
      return
    }

    limpiarAviso()
    const { error: errorReset } = await supabase.auth.resetPasswordForEmail(identificador.trim())
    if (errorReset) setError(errorReset.message)
    else setMensaje('Te vamos a mandar un mail para recuperarla. Revisá tu casilla.')
  }

  return {
    modo,
    identificador,
    setIdentificador,
    email,
    setEmail,
    username,
    setUsername,
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
