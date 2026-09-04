import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Si todavía no se completó el .env, el resto de la app se entera por acá
// (en vez de romper con un error críptico apenas se importa este módulo) y
// puede mostrar un aviso claro en vez de una pantalla en blanco.
export const supabaseConfigurado = Boolean(supabaseUrl && supabaseAnonKey)

// persistSession/autoRefreshToken ya son el default de supabase-js, pero se
// dejan explícitos (prompt-32, sección 4) para que nadie los rompa sin
// querer más adelante: la sesión tiene que sobrevivir a cerrar y reabrir la
// app en el mismo dispositivo, sin pedir login de nuevo hasta un logout
// explícito.
export const supabase = supabaseConfigurado
  ? createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true } })
  : null
