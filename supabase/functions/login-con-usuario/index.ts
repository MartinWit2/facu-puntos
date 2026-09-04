// Edge Function que resuelve el login con nombre de usuario (prompt-32,
// sección 3). El cliente NUNCA hace un lookup directo username → email
// contra una tabla legible públicamente — eso dejaría buscar el email real
// de cualquiera sabiendo (o probando) su username, que es una fuga de
// privacidad. Acá el lookup vive del lado del servidor, con la service role
// key, y lo único que vuelve al cliente son los tokens de sesión si las
// credenciales dieron bien (o un error genérico si no — nunca se distingue
// "no existe el usuario" de "contraseña incorrecta", para no filtrar qué
// usernames existen).
import { createClient } from 'npm:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

// Mismo patrón que EMAIL_RE de src/hooks/useAuthForm.js — se duplica acá
// porque este archivo corre en Deno, no en el bundle de Vite.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const ERROR_GENERICO = 'Usuario/email o contraseña incorrectos.'

// Siempre 200: el resultado (éxito o error de credenciales) viaja en el
// body de una respuesta "bien formada" en vez de en el código HTTP — así el
// cliente lo lee derecho de `data` con supabase.functions.invoke, sin tener
// que parsear el body de un FunctionsHttpError.
function jsonOk(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })

  try {
    const { identificador, password } = await req.json()
    if (!identificador || !password) return jsonOk({ error: ERROR_GENERICO })

    let email = String(identificador).trim()

    if (!EMAIL_RE.test(email)) {
      // No tiene forma de email: se asume username y se busca el email real
      // con la service role key (nunca con la anon key desde acá, para que
      // esto no equivalga a exponer un endpoint público de lookup).
      const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

      const { data: perfil } = await admin.from('perfiles').select('user_id').ilike('username', email).maybeSingle()

      if (!perfil) return jsonOk({ error: ERROR_GENERICO })

      const { data: usuarioAuth, error: errorUsuario } = await admin.auth.admin.getUserById(perfil.user_id as string)
      if (errorUsuario || !usuarioAuth?.user?.email) return jsonOk({ error: ERROR_GENERICO })

      email = usuarioAuth.user.email
    }

    // El signInWithPassword en sí se hace con la anon key, igual que lo
    // haría el cliente directamente — acá el único paso "privilegiado" es
    // la traducción de username a email de arriba.
    const anon = createClient(SUPABASE_URL, ANON_KEY)
    const { data, error } = await anon.auth.signInWithPassword({ email, password })
    if (error || !data.session) return jsonOk({ error: ERROR_GENERICO })

    return jsonOk({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    })
  } catch (error) {
    console.error(error)
    return jsonOk({ error: ERROR_GENERICO })
  }
})
