import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Si todavía no se completó el .env, el resto de la app se entera por acá
// (en vez de romper con un error críptico apenas se importa este módulo) y
// puede mostrar un aviso claro en vez de una pantalla en blanco.
export const supabaseConfigurado = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = supabaseConfigurado ? createClient(supabaseUrl, supabaseAnonKey) : null
