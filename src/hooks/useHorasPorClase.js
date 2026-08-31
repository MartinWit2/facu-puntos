import { useState } from 'react'

// Calculadora de "horas por clase × cantidad de clases" para cargar horas
// cátedra sin hacer la cuenta a mano. Es puramente una ayuda de carga: el
// modo, y los dos números que lo componen, son efímeros — nunca se guardan,
// solo producen un total que se entrega vía onTotal(total), exactamente
// igual que si se hubiera tipeado ese número directo en el modo "Total".
export function useHorasPorClase(onTotal) {
  const [porClase, setPorClase] = useState(false)
  const [horasPorClase, setHorasPorClase] = useState('')
  const [cantidadClases, setCantidadClases] = useState('')

  const actualizarTotal = (horasTexto, clasesTexto) => {
    const horas = Number(horasTexto)
    const clases = Number(clasesTexto)
    if (horasTexto === '' || clasesTexto === '' || !Number.isFinite(horas) || horas <= 0) return
    if (!Number.isInteger(clases) || clases < 1) return
    onTotal(Math.round(horas * clases * 100) / 100)
  }

  const handleHorasPorClaseChange = (e) => {
    const valor = e.target.value
    setHorasPorClase(valor)
    actualizarTotal(valor, cantidadClases)
  }

  const handleCantidadClasesChange = (e) => {
    const valor = e.target.value
    setCantidadClases(valor)
    actualizarTotal(horasPorClase, valor)
  }

  const handleTogglePorClase = () => {
    const activado = !porClase
    setPorClase(activado)
    if (activado) {
      setHorasPorClase('')
      setCantidadClases('')
    }
  }

  return { porClase, horasPorClase, cantidadClases, handleHorasPorClaseChange, handleCantidadClasesChange, handleTogglePorClase }
}
