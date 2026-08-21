import { useEffect, useState } from 'react'
import { supabase, supabaseConfigurado } from '../lib/supabaseClient'
import { AuthContext } from './authContextObject.js'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [cargando, setCargando] = useState(supabaseConfigurado)

  useEffect(() => {
    if (!supabaseConfigurado) return

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setCargando(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, nuevaSession) => {
      setSession(nuevaSession)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    configurado: supabaseConfigurado,
    session,
    usuario: session?.user ?? null,
    cargando,
    cerrarSesion: () => supabase.auth.signOut(),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
