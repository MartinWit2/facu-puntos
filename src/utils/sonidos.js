// Sonidos cortitos de feedback (sección "2" del prompt de notificaciones,
// reemplazados después por sonar a aplausos/ovación en vez de a un pitido
// de videojuego): sintetizados con Web Audio API en vez de archivos de
// audio, así no hace falta conseguir ni licenciar ningún asset. Dos
// variantes reconocibles como "cosas distintas" — fanfarria corta +
// ovación grande para un logro de materia, ovación sola y más corta para
// un canje de premio.
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

// Buffer de ruido blanco base para sintetizar los aplausos: cada "clap"
// recorta un pedacito random de acá en vez de generar ruido nuevo cada vez.
// Se crea una sola vez por AudioContext (el sampleRate hace falta para
// armarlo, así que no puede ser un valor módulo-level fijo).
let bufferRuido = null

function obtenerBufferRuido(ctx) {
  if (!bufferRuido) {
    const duracion = 0.2 // 200ms de ruido base alcanza para recortar cada clap
    const frames = Math.floor(ctx.sampleRate * duracion)
    bufferRuido = ctx.createBuffer(1, frames, ctx.sampleRate)
    const datos = bufferRuido.getChannelData(0)
    for (let i = 0; i < frames; i++) datos[i] = Math.random() * 2 - 1
  }
  return bufferRuido
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

// Un aplauso individual: ruido blanco recortado, pasado por un filtro
// bandpass con frecuencia central al azar (para que no suenen todos
// idénticos) y una envolvente bien corta — ataque casi instantáneo, caída
// rápida — así suena seco tipo "clap" y no un silbido largo.
function tocarClap(ctx, buffer, inicioEnSegundos, volumen) {
  const fuente = ctx.createBufferSource()
  fuente.buffer = buffer

  const filtro = ctx.createBiquadFilter()
  filtro.type = 'bandpass'
  filtro.frequency.value = 1000 + Math.random() * 2000 // 1000-3000 Hz
  filtro.Q.value = 1.2

  const ganancia = ctx.createGain()
  const inicio = ctx.currentTime + inicioEnSegundos
  const ataque = 0.002 + Math.random() * 0.003 // 2-5ms
  const caida = 0.03 + Math.random() * 0.05 // 30-80ms
  const fin = inicio + ataque + caida

  ganancia.gain.setValueAtTime(0, inicio)
  ganancia.gain.linearRampToValueAtTime(volumen, inicio + ataque)
  ganancia.gain.exponentialRampToValueAtTime(0.001, fin)

  fuente.connect(filtro)
  filtro.connect(ganancia)
  ganancia.connect(ctx.destination)

  const offsetMax = Math.max(buffer.duration - 0.05, 0)
  fuente.start(inicio, Math.random() * offsetMax)
  fuente.stop(fin + 0.02)
}

// Una "ovación": varios claps con timings escalonados y jitter en tiempo y
// volumen, para que suene a aplauso real de gente y no a un patrón
// robótico repetido.
function tocarAplausos(ctx, buffer, cantidad, duracionTotal, volumenBase, inicioBase) {
  for (let i = 0; i < cantidad; i++) {
    const posicionBase = (i / cantidad) * duracionTotal
    const jitter = (Math.random() - 0.5) * (duracionTotal / cantidad) * 0.8
    const inicio = inicioBase + Math.max(0, posicionBase + jitter)
    const volumen = volumenBase * (0.7 + Math.random() * 0.6)
    tocarClap(ctx, buffer, inicio, volumen)
  }
}

// Fanfarria corta (el arpeggio que ya existía) + ovación grande — el
// festejo más importante de los dos (aprobar/promocionar/firmar).
function tocarSonidoMateria(ctx) {
  const volumen = 0.16
  tocarNota(ctx, 523.25, 0, 0.16, 'triangle', volumen) // C5
  tocarNota(ctx, 659.25, 0.09, 0.16, 'triangle', volumen) // E5
  tocarNota(ctx, 783.99, 0.18, 0.24, 'triangle', volumen) // G5

  const buffer = obtenerBufferRuido(ctx)
  const cantidadClaps = 24 + Math.floor(Math.random() * 7) // 24-30
  tocarAplausos(ctx, buffer, cantidadClaps, 1.3, 0.22, 0.28) // arranca mezclado con el final de la fanfarria
}

// Ovación sola, más corta — para un canje de premio (queda distinguible de
// la de materia por no tener fanfarria y durar menos).
function tocarSonidoPremio(ctx) {
  const buffer = obtenerBufferRuido(ctx)
  const cantidadClaps = 15 + Math.floor(Math.random() * 6) // 15-20
  tocarAplausos(ctx, buffer, cantidadClaps, 0.8, 0.2, 0)
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
