import { useState } from 'react'
import { useHorasPorClase } from '../hooks/useHorasPorClase'
import { nombreAnio } from '../utils/anio'
import { calcularPoolPuntos } from '../utils/puntos'
import './HojaNuevaMateria.css'

const RANGOS = {
  horasCatedra: { min: 32, max: 320, step: 16 },
  cantidadParciales: { min: 1, max: 4, step: 1 },
  cantidadRecuperatorios: { min: 0, max: 4, step: 1 },
  cantidadInstanciasFinal: { min: 0, max: 6, step: 1 },
}

// Borrador local para el input de "otro año": antes estaba atado directo a
// form.anioCursada con un fallback `|| 1`, así que borrar el "1" para
// escribir otro número lo volvía a poner en 1 al instante y nunca dejaba
// quedar el campo vacío mientras se tipea. Acá el input vive de su propio
// texto (puede quedar vacío o a medio escribir) y solo confirma hacia
// arriba cuando el texto ya es un año válido; si se deja inválido o vacío
// al salir del campo, vuelve a mostrar el último valor válido.
function CampoAnioOtro({ valor, onCambiar }) {
  const [texto, setTexto] = useState(String(valor))
  const [valorSincronizado, setValorSincronizado] = useState(valor)
  if (valor !== valorSincronizado) {
    setValorSincronizado(valor)
    setTexto(String(valor))
  }

  const handleChange = (e) => {
    const nuevoTexto = e.target.value
    setTexto(nuevoTexto)
    const parsed = Number(nuevoTexto)
    if (nuevoTexto !== '' && Number.isInteger(parsed) && parsed >= 1) {
      onCambiar(parsed)
    }
  }

  const handleBlur = () => {
    setTexto(String(valor))
  }

  return <input type="number" min="1" value={texto} onChange={handleChange} onBlur={handleBlur} />
}

function Stepper({ campo, valor, onCambiar }) {
  const { min, max, step } = RANGOS[campo]
  return (
    <div className="hoja-materia-stepper">
      <button type="button" onClick={() => onCambiar(Math.max(min, valor - step))} disabled={valor <= min}>
        −
      </button>
      <span className="hoja-materia-stepper-valor">{valor}</span>
      <button type="button" onClick={() => onCambiar(Math.min(max, valor + step))} disabled={valor >= max}>
        +
      </button>
    </div>
  )
}

// Cuerpo de la hoja de nueva materia (sección "2c" del handoff), controlado
// desde MateriasMobile.jsx igual que HojaEditarMateria: sin estado propio
// para el borrador, solo onCambiar(campo, valor) sobre el que vive en la
// página. La excepción es el modo "horas por clase × cantidad de clases"
// (ver más abajo): es una ayuda de carga puramente efímera, no forma parte
// del borrador que se termina guardando.
function HojaNuevaMateria({ form, aniosDisponibles, puntosPorHora, onCambiar }) {
  const poolPuntos = calcularPoolPuntos(form.horasCatedra, puntosPorHora)
  // El año elegido siempre aparece como chip, aunque no esté entre los años
  // que ya tienen materias cargadas (ej. la primera materia de un año nuevo).
  const opcionesAnio = [...new Set([...aniosDisponibles, form.anioCursada])].sort((a, b) => a - b)

  // Carga alternativa de horas cátedra: útil cuando la fuente del plan da
  // "horas por clase" y "cantidad de clases" en vez del total. Estado 100%
  // local — al calcularse el total, se manda hacia arriba con el mismo
  // onCambiar('horasCatedra', total) de siempre, como si se hubiera tipeado
  // directo. No se guarda ni "horas por clase" ni "cantidad de clases".
  const {
    porClase,
    horasPorClase,
    cantidadClases,
    handleHorasPorClaseChange,
    handleCantidadClasesChange,
    handleTogglePorClase,
  } = useHorasPorClase((total) => onCambiar('horasCatedra', total))

  return (
    <div className="hoja-materia-form">
      <label className="hoja-materia-campo">
        <span className="hoja-materia-label">Nombre</span>
        <input
          type="text"
          className="hoja-materia-input"
          value={form.nombre}
          onChange={(e) => onCambiar('nombre', e.target.value)}
          placeholder="Sistemas Operativos"
        />
      </label>

      <div className="hoja-materia-campo">
        <span className="hoja-materia-label">Año de cursada</span>
        <div className="hoja-materia-anio-grilla">
          {opcionesAnio.map((anio) => (
            <button
              key={anio}
              type="button"
              className={anio === form.anioCursada ? 'hoja-materia-celda activa' : 'hoja-materia-celda'}
              onClick={() => onCambiar('anioCursada', anio)}
            >
              {nombreAnio(anio)}
            </button>
          ))}
        </div>
        <label className="hoja-materia-anio-otro">
          <span>¿Otro año?</span>
          <CampoAnioOtro valor={form.anioCursada} onCambiar={(valor) => onCambiar('anioCursada', valor)} />
        </label>
      </div>

      <div className="hoja-materia-campo">
        {porClase ? (
          <>
            <div className="hoja-materia-campo-cabecera">
              <span className="hoja-materia-label">Horas por clase</span>
              <input
                type="number"
                min="0"
                step="0.5"
                className="hoja-materia-input-chico"
                value={horasPorClase}
                onChange={handleHorasPorClaseChange}
                placeholder="2"
              />
            </div>
            <div className="hoja-materia-campo-cabecera">
              <span className="hoja-materia-label">Cantidad de clases</span>
              <input
                type="number"
                min="1"
                step="1"
                className="hoja-materia-input-chico"
                value={cantidadClases}
                onChange={handleCantidadClasesChange}
                placeholder="34"
              />
            </div>
            <p className="hoja-materia-ayuda">
              Total de clases en todo el período (ej: 2 veces por semana × 17 semanas = 34).
            </p>
            <p className="hoja-materia-ayuda">= {form.horasCatedra || 0} hs cátedra</p>
          </>
        ) : (
          <div className="hoja-materia-campo-cabecera">
            <span className="hoja-materia-label">Horas cátedra</span>
            <Stepper campo="horasCatedra" valor={form.horasCatedra} onCambiar={(v) => onCambiar('horasCatedra', v)} />
          </div>
        )}
        <p className="hoja-materia-ayuda">{form.noSumaPuntos ? 'No va a sumar puntos' : `Pool de puntos: ${poolPuntos}`}</p>

        <button type="button" className="hoja-materia-switch-fila hoja-materia-horas-switch" onClick={handleTogglePorClase}>
          <span className="hoja-materia-switch-texto">
            <span className="hoja-materia-label">Cargar por clase</span>
            <span className="hoja-materia-ayuda">Horas por clase × cantidad de clases, en vez del total.</span>
          </span>
          <span className={porClase ? 'hoja-materia-switch activo' : 'hoja-materia-switch'} aria-hidden="true">
            <span className="hoja-materia-switch-perilla" />
          </span>
        </button>
      </div>

      <div className="hoja-materia-campo">
        <div className="hoja-materia-campo-cabecera">
          <span className="hoja-materia-label">Parciales</span>
          <Stepper
            campo="cantidadParciales"
            valor={form.cantidadParciales}
            onCambiar={(v) => onCambiar('cantidadParciales', v)}
          />
        </div>
      </div>

      <div className="hoja-materia-campo">
        <div className="hoja-materia-campo-cabecera">
          <span className="hoja-materia-label">Recuperatorios por parcial</span>
          <Stepper
            campo="cantidadRecuperatorios"
            valor={form.cantidadRecuperatorios}
            onCambiar={(v) => onCambiar('cantidadRecuperatorios', v)}
          />
        </div>
      </div>

      <div className="hoja-materia-campo">
        <div className="hoja-materia-campo-cabecera">
          <span className="hoja-materia-label">Instancias de final</span>
          <Stepper
            campo="cantidadInstanciasFinal"
            valor={form.cantidadInstanciasFinal}
            onCambiar={(v) => onCambiar('cantidadInstanciasFinal', v)}
          />
        </div>
      </div>

      <button
        type="button"
        className="hoja-materia-switch-fila hoja-materia-no-suma"
        onClick={() => onCambiar('noSumaPuntos', !form.noSumaPuntos)}
      >
        <span className="hoja-materia-switch-texto">
          <span className="hoja-materia-label">No sumar puntos</span>
          <span className="hoja-materia-ayuda">Ya la tenía aprobada antes de usar la app.</span>
        </span>
        <span className={form.noSumaPuntos ? 'hoja-materia-switch activo' : 'hoja-materia-switch'} aria-hidden="true">
          <span className="hoja-materia-switch-perilla" />
        </span>
      </button>
    </div>
  )
}

export default HojaNuevaMateria
