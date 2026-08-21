import { useEffect, useRef, useState } from 'react'

// Combobox de texto libre: al tocar la flechita se ven TODAS las categorías
// existentes (sin filtrar por lo que ya esté escrito, a diferencia del
// <datalist> nativo); al escribir, la lista sí se filtra en vivo. También
// se puede tipear una categoría totalmente nueva sin elegir ninguna opción.
function ComboboxCategoria({ value, onChange, opciones }) {
  const [abierto, setAbierto] = useState(false)
  const [filtro, setFiltro] = useState('')
  const contenedorRef = useRef(null)

  useEffect(() => {
    const handleClickFuera = (e) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
        setAbierto(false)
      }
    }
    document.addEventListener('mousedown', handleClickFuera)
    return () => document.removeEventListener('mousedown', handleClickFuera)
  }, [])

  const opcionesFiltradas = opciones.filter((opcion) => opcion.toLowerCase().includes(filtro.toLowerCase()))

  const handleInputChange = (e) => {
    const nuevoValor = e.target.value
    onChange(nuevoValor)
    setFiltro(nuevoValor)
    setAbierto(true)
  }

  const handleToggleFlecha = () => {
    setAbierto((prev) => {
      const next = !prev
      if (next) setFiltro('')
      return next
    })
  }

  const handleSeleccionar = (opcion) => {
    onChange(opcion)
    setAbierto(false)
  }

  return (
    <div className="combobox-categoria" ref={contenedorRef}>
      <div className="combobox-input-row">
        <input type="text" value={value} onChange={handleInputChange} placeholder="Comida" />
        <button
          type="button"
          className="combobox-flecha"
          onClick={handleToggleFlecha}
          aria-label="Mostrar categorías existentes"
        >
          {abierto ? '▴' : '▾'}
        </button>
      </div>
      {abierto && opcionesFiltradas.length > 0 && (
        <ul className="combobox-opciones">
          {opcionesFiltradas.map((opcion) => (
            <li key={opcion}>
              <button type="button" onClick={() => handleSeleccionar(opcion)}>
                {opcion}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ComboboxCategoria
