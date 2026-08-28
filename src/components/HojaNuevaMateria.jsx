import { nombreAnio } from '../utils/anio'
import { calcularPoolPuntos } from '../utils/puntos'
import './HojaNuevaMateria.css'

const RANGOS = {
  horasCatedra: { min: 32, max: 320, step: 16 },
  cantidadParciales: { min: 1, max: 4, step: 1 },
  cantidadRecuperatorios: { min: 0, max: 4, step: 1 },
  cantidadInstanciasFinal: { min: 0, max: 6, step: 1 },
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
// desde MateriasMobile.jsx igual que HojaEditarMateria: sin estado propio,
// solo onCambiar(campo, valor) sobre el borrador que vive en la página.
function HojaNuevaMateria({ form, aniosDisponibles, puntosPorHora, onCambiar }) {
  const poolPuntos = calcularPoolPuntos(form.horasCatedra, puntosPorHora)
  // El año elegido siempre aparece como chip, aunque no esté entre los años
  // que ya tienen materias cargadas (ej. la primera materia de un año nuevo).
  const opcionesAnio = [...new Set([...aniosDisponibles, form.anioCursada])].sort((a, b) => a - b)

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
          <input
            type="number"
            min="1"
            value={form.anioCursada}
            onChange={(e) => onCambiar('anioCursada', Math.max(1, Number(e.target.value) || 1))}
          />
        </label>
      </div>

      <div className="hoja-materia-campo">
        <div className="hoja-materia-campo-cabecera">
          <span className="hoja-materia-label">Horas cátedra</span>
          <Stepper campo="horasCatedra" valor={form.horasCatedra} onCambiar={(v) => onCambiar('horasCatedra', v)} />
        </div>
        <p className="hoja-materia-ayuda">{form.noSumaPuntos ? 'No va a sumar puntos' : `Pool de puntos: ${poolPuntos}`}</p>
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
