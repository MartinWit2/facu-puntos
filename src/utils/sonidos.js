// Sonidos cortitos de feedback (sección "2" del prompt de notificaciones):
// sintetizados con Web Audio API en vez de archivos de audio, así no hace
// falta conseguir ni licenciar ningún asset. Dos variantes reconocibles
// como "cosas distintas" — un arpeggio ascendente más grave para un logro
// de materia, y un "ding" más agudo y cortito, tipo moneda, para un canje.
const CLAVE_PREFERENCIA = 'unipoints:sonido'

// Un solo AudioContext reutilizado entre llamadas — crear uno nuevo por
// sonido es innecesario y en algunos navegadores cuenta como un gesto de
// usuario gastado. Se crea recién al primer sonido (no al importar el
// módulo), porque construir un AudioContext antes de cualquier gesto del
// usuario puede arrancar "suspended" en varios navegadores.
let audioContext = null

function obtenerContexto() {
  if (!audioContext) {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext
    if (!AudioContextCtor) return null
    audioContext = new AudioContextCtor()
  }
  return audioContext
}

export function sonidoActivado() {
  return localStorage.getItem(CLAVE_PREFERENCIA) !== 'off'
}

export function setSonidoActivado(activado) {
  localStorage.setItem(CLAVE_PREFERENCIA, activado ? 'on' : 'off')
}

// Una nota cortita con envolvente rápida (ataque casi instantáneo, decaída
// exponencial) para que no suene a pitido sostenido.
function tocarNota(ctx, frecuencia, inicioEnSegundos, duracionEnSegundos, tipoOnda, volumen) {
  const oscilador = ctx.createOscillator()
  const ganancia = ctx.createGain()
  oscilador.type = tipoOnda
  oscilador.frequency.value = frecuencia

  const inicio = ctx.currentTime + inicioEnSegundos
  const fin = inicio + duracionEnSegundos
  ganancia.gain.setValueAtTime(0, inicio)
  ganancia.gain.linearRampToValueAtTime(volumen, inicio + 0.012)
  ganancia.gain.exponentialRampToValueAtTime(0.001, fin)

  oscilador.connect(ganancia)
  ganancia.connect(ctx.destination)
  oscilador.start(inicio)
  oscilador.stop(fin + 0.02)
}

// Arpeggio ascendente de 3 notas (do-mi-sol), ~420ms — pensado para leerse
// como "logro" (aprobar/promocionar/firmar una materia).
function tocarSonidoMateria(ctx) {
  const volumen = 0.16
  tocarNota(ctx, 523.25, 0, 0.16, 'triangle', volumen) // C5
  tocarNota(ctx, 659.25, 0.09, 0.16, 'triangle', volumen) // E5
  tocarNota(ctx, 783.99, 0.18, 0.24, 'triangle', volumen) // G5
}

// Dos notas agudas y cortitas tipo "moneda", ~260ms — para un canje de premio.
function tocarSonidoPremio(ctx) {
  const volumen = 0.14
  tocarNota(ctx, 1318.51, 0, 0.11, 'square', volumen) // E6
  tocarNota(ctx, 1567.98, 0.09, 0.17, 'square', volumen) // G6
}

// Llamar SIEMPRE desde el mismo handler de un click/tap (elegir una nota,
// confirmar un canje) — los navegadores bloquean audio que no venga de un
// gesto directo del usuario, y un AudioContext puede arrancar "suspended"
// aunque el gesto sea válido, así que hace falta resumirlo ahí mismo antes
// de reproducir.
export function reproducirSonido(variante) {
  if (!sonidoActivado()) return
  const ctx = obtenerContexto()
  if (!ctx) return

  const reproducir = () => {
    if (variante === 'premio') tocarSonidoPremio(ctx)
    else tocarSonidoMateria(ctx)
  }

  if (ctx.state === 'suspended') {
    ctx.resume().then(reproducir).catch(() => {})
  } else {
    reproducir()
  }
}
