import { useState } from 'react'
import './HojaEditarMateria.css'

// Rangos de los steppers. El handoff dice que Recuperatorios arranca en 1,
// pero el modelo real permite 0 recuperatorios (una materia sin recu) — acá
// gana el repo, mínimo 0.
const RANGOS = {
  horasCatedra: { min: 32, max: 320, step: 16 },
  cantidadParciales: { min: 1, max: 4, step: 1 },
  cantidadRecuperatorios: { min: 0, max: 4, step: 1 },
  cantidadInstanciasFinal: { min: 1, max: 6, step: 1 },
}

const NOTAS_APROBACION = [4, 5, 6, 7, 8]
const NOTAS_PROMOCION = [6, 7, 8, 9, 10]

function Stepper({ campo, valor, onCambiar }) {
  const { min, max, step } = RANGOS[campo]
  return (
    <div className="editar-materia-stepper">
      <button type="button" onClick={() => onCambiar(Math.max(min, valor - step))} disabled={valor <= min}>
        −
      </button>
      <span className="editar-materia-stepper-valor">{valor}</span>
      <button type="button" onClick={() => onCambiar(Math.min(max, valor + step))} disabled={valor >= max}>
        +
      </button>
    </div>
  )
}

// Borrador local para el nombre: antes escribía directo sobre `materia.nombre`
// y guardaba en Supabase en cada letra (con el cache compartido, cada una de
// esas escrituras ahora además hace re-renderizar toda la app). Acá el campo
// vive de su propio estado mientras se escribe y recién confirma el cambio
// al perder el foco, sin tocar la red por cada tecla.
function CampoNombre({ valor, onConfirmar }) {
  const [borrador, setBorrador] = useState(valor)
  // Ajuste de estado durante el render (patrón recomendado por React para
  // "resetear" un borrador cuando cambia el valor de afuera) en vez de un
  // efecto, para no disparar una vuelta extra de render por cada cambio.
  const [valorSincronizado, setValorSincronizado] = useState(valor)
  if (valor !== valorSincronizado) {
    setValorSincronizado(valor)
    setBorrador(valor)
  }

  const confirmar = () => {
    const limpio = borrador.trim()
    if (!limpio) {
      setBorrador(valor)
      return
    }
    if (limpio !== valor) onConfirmar(limpio)
  }

  return (
    <input
      type="text"
      className="editar-materia-input"
      value={borrador}
      onChange={(e) => setBorrador(e.target.value)}
      onBlur={confirmar}
    />
  )
}

function GrillaNotaChica({ valores, seleccionado, onElegir }) {
  return (
    <div className="editar-materia-grilla-chica">
      {valores.map((valor) => (
        <button
          key={valor}
          type="button"
          className={valor === seleccionado ? 'editar-materia-celda-chica activa' : 'editar-materia-celda-chica'}
          onClick={() => onElegir(valor)}
        >
          {valor}
        </button>
      ))}
    </div>
  )
}

// Cuerpo de la hoja de edición (sección "2b" del handoff). Todo se aplica en
// vivo llamando directo a los handlers que ya existían sueltos en la
// página (handleOverrideNumero, handlePermitePromocionOverride, handleTick):
// acá solo cambia dónde se ven, no cómo funcionan.
function HojaEditarMateria({
  materia,
  reglas,
  onEditarCampo,
  onOverrideNumero,
  onPermitePromocionOverride,
  onPromocionPorPromedioOverride,
  onTick,
  onVolverReglasCarrera,
}) {
  // Carga alternativa de horas cátedra: útil cuando la fuente del plan da
  // "horas por clase" y "cantidad de clases" en vez del total. Estado 100%
  // local — al calcularse el total, se manda hacia arriba con el mismo
  // onEditarCampo('horasCatedra', total) de siempre. No se guarda ni "horas
  // por clase" ni "cantidad de clases".
  const [porClase, setPorClase] = useState(false)
  const [horasPorClase, setHorasPorClase] = useState('')
  const [cantidadClases, setCantidadClases] = useState('')

  const actualizarTotalPorClase = (horasTexto, clasesTexto) => {
    const horas = Number(horasTexto)
    const clases = Number(clasesTexto)
    if (horasTexto === '' || clasesTexto === '' || !Number.isFinite(horas) || horas <= 0) return
    if (!Number.isInteger(clases) || clases < 1) return
    onEditarCampo('horasCatedra', Math.round(horas * clases * 100) / 100)
  }

  const handleHorasPorClaseChange = (e) => {
    const valor = e.target.value
    setHorasPorClase(valor)
    actualizarTotalPorClase(valor, cantidadClases)
  }

  const handleCantidadClasesChange = (e) => {
    const valor = e.target.value
    setCantidadClases(valor)
    actualizarTotalPorClase(horasPorClase, valor)
  }

  const handleTogglePorClase = () => {
    const activado = !porClase
    setPorClase(activado)
    // Al pasar a "Por clase" no hay forma de "deshacer" un total en sus dos
    // factores: los inputs arrancan vacíos y el total existente
    // (materia.horasCatedra) queda como estaba hasta que se completen los dos.
    if (activado) {
      setHorasPorClase('')
      setCantidadClases('')
    }
  }

  const tieneOverrides =
    materia.notaAprobacionOverride != null ||
    materia.notaPromocionOverride != null ||
    materia.permitePromocionOverride != null ||
    materia.promocionPorPromedioOverride != null

  return (
    <>
      <p className="editar-materia-subtitulo">{materia.nombre}</p>

      <label className="editar-materia-campo">
        <span className="editar-materia-label">Nombre</span>
        <CampoNombre valor={materia.nombre} onConfirmar={(valor) => onEditarCampo('nombre', valor)} />
      </label>

      <div className="editar-materia-campo">
        {porClase ? (
          <>
            <div className="editar-materia-campo-cabecera">
              <span className="editar-materia-label">Horas por clase</span>
              <input
                type="number"
                min="0.1"
                step="0.5"
                className="editar-materia-input-chico"
                value={horasPorClase}
                onChange={handleHorasPorClaseChange}
                placeholder="2"
              />
            </div>
            <div className="editar-materia-campo-cabecera">
              <span className="editar-materia-label">Cantidad de clases</span>
              <input
                type="number"
                min="1"
                step="1"
                className="editar-materia-input-chico"
                value={cantidadClases}
                onChange={handleCantidadClasesChange}
                placeholder="34"
              />
            </div>
          </>
        ) : (
          <div className="editar-materia-campo-cabecera">
            <span className="editar-materia-label">Horas cátedra</span>
            <Stepper
              campo="horasCatedra"
              valor={materia.horasCatedra ?? RANGOS.horasCatedra.min}
              onCambiar={(valor) => onEditarCampo('horasCatedra', valor)}
            />
          </div>
        )}

        <button type="button" className="editar-materia-switch-fila editar-materia-horas-switch" onClick={handleTogglePorClase}>
          <span className="editar-materia-switch-texto">
            <span className="editar-materia-label">Cargar por clase</span>
          </span>
          <span className={porClase ? 'editar-materia-switch activo' : 'editar-materia-switch'} aria-hidden="true">
            <span className="editar-materia-switch-perilla" />
          </span>
        </button>
      </div>

      <div className="editar-materia-campo">
        <div className="editar-materia-campo-cabecera">
          <span className="editar-materia-label">Parciales</span>
          <Stepper
            campo="cantidadParciales"
            valor={materia.cantidadParciales}
            onCambiar={(valor) => onEditarCampo('cantidadParciales', valor)}
          />
        </div>
      </div>

      <div className="editar-materia-campo">
        <div className="editar-materia-campo-cabecera">
          <span className="editar-materia-label">Recuperatorios por parcial</span>
          <Stepper
            campo="cantidadRecuperatorios"
            valor={materia.cantidadRecuperatorios}
            onCambiar={(valor) => onEditarCampo('cantidadRecuperatorios', valor)}
          />
        </div>
      </div>

      <div className="editar-materia-campo">
        <div className="editar-materia-campo-cabecera">
          <span className="editar-materia-label">Instancias de final</span>
          <Stepper
            campo="cantidadInstanciasFinal"
            valor={materia.cantidadInstanciasFinal}
            onCambiar={(valor) => onEditarCampo('cantidadInstanciasFinal', valor)}
          />
        </div>
      </div>

      <button
        type="button"
        className="editar-materia-switch-fila"
        onClick={() => onPermitePromocionOverride(!reglas.permitePromocion)}
      >
        <span className="editar-materia-switch-texto">
          <span className="editar-materia-label">Permite promoción</span>
        </span>
        <span className={reglas.permitePromocion ? 'editar-materia-switch activo' : 'editar-materia-switch'} aria-hidden="true">
          <span className="editar-materia-switch-perilla" />
        </span>
      </button>

      <div className="editar-materia-campo">
        <span className="editar-materia-label">Nota de aprobación</span>
        <GrillaNotaChica
          valores={NOTAS_APROBACION}
          seleccionado={reglas.notaAprobacion}
          onElegir={(valor) => onOverrideNumero('notaAprobacionOverride', valor)}
        />
      </div>

      {reglas.permitePromocion && (
        <>
          <div className="editar-materia-campo">
            <span className="editar-materia-label">Nota de promoción</span>
            <GrillaNotaChica
              valores={NOTAS_PROMOCION}
              seleccionado={reglas.notaPromocion}
              onElegir={(valor) => onOverrideNumero('notaPromocionOverride', valor)}
            />
          </div>

          <button
            type="button"
            className="editar-materia-switch-fila"
            onClick={() => onPromocionPorPromedioOverride(!reglas.promocionPorPromedio)}
          >
            <span className="editar-materia-switch-texto">
              <span className="editar-materia-label">Promoción por promedio</span>
            </span>
            <span
              className={reglas.promocionPorPromedio ? 'editar-materia-switch activo' : 'editar-materia-switch'}
              aria-hidden="true"
            >
              <span className="editar-materia-switch-perilla" />
            </span>
          </button>
        </>
      )}

      <div className="editar-materia-forzar">
        <span className="editar-materia-label">Forzar resultado</span>
        <div className="detalle-mobile-toggles">
          <button
            type="button"
            className={materia.tickManual === 'promocion' ? 'detalle-mobile-toggle activo' : 'detalle-mobile-toggle'}
            onClick={() => onTick('promocion')}
          >
            Promocionó
          </button>
          <button
            type="button"
            className={materia.tickManual === 'firma' ? 'detalle-mobile-toggle activo' : 'detalle-mobile-toggle'}
            onClick={() => onTick('firma')}
          >
            Firmó
          </button>
        </div>
      </div>

      {tieneOverrides && (
        <button type="button" className="editar-materia-volver" onClick={onVolverReglasCarrera}>
          Volver a las reglas de la carrera
        </button>
      )}
    </>
  )
}

export default HojaEditarMateria
