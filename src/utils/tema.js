// Elección manual de tema claro/oscuro/automático (sección "3" del prompt
// Próximos/progreso-carrera/tema) — pura mecánica de qué atributo setear,
// los valores de color en sí viven en src/index.css. Preferencia de
// DISPOSITIVO en localStorage, mismo criterio que sonidos.js: no es de
// cuenta, no va a Supabase.
const CLAVE_PREFERENCIA = 'unipoints:tema'
const TEMAS_VALIDOS = ['claro', 'oscuro', 'automatico']

export function temaElegido() {
  const guardado = localStorage.getItem(CLAVE_PREFERENCIA)
  return TEMAS_VALIDOS.includes(guardado) ? guardado : 'automatico'
}

// :root en el CSS (los bloques :root[data-theme="dark"/"light"] de
// index.css) apunta al <html>, no al <div id="root"> de React — el
// atributo tiene que ir ahí para que esos selectores lo vean.
export function aplicarTema(tema) {
  if (tema === 'claro') document.documentElement.setAttribute('data-theme', 'light')
  else if (tema === 'oscuro') document.documentElement.setAttribute('data-theme', 'dark')
  else document.documentElement.removeAttribute('data-theme')
}

export function setTemaElegido(tema) {
  localStorage.setItem(CLAVE_PREFERENCIA, tema)
  aplicarTema(tema)
}

// Llamar una vez al arrancar la app, antes de montar React, para que la
// preferencia guardada se aplique desde el primer render.
export function inicializarTema() {
  aplicarTema(temaElegido())
}
