import { supabase } from '../lib/supabaseClient'

// Sube un archivo a la carpeta del usuario dentro de un bucket de Storage
// (el primer segmento del path tiene que ser el user_id: es lo que exige
// la política RLS del bucket, ver migraciones 0017/0018) y devuelve su URL
// pública. Los dos buckets que lo usan (premios-imagenes, canjes-fotos)
// son públicos, así que esa URL sirve directo como src de un <img>.
export async function subirArchivo(bucket, userId, archivo) {
  const extension = archivo.name.split('.').pop()
  const nombre = `${userId}/${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage.from(bucket).upload(nombre, archivo)
  if (error) throw error
  const { data } = supabase.storage.from(bucket).getPublicUrl(nombre)
  return data.publicUrl
}
