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
  onTick,
  onVolverReglasCarrera,
}) {
  const poolBase = materia.horasCatedra ? materia.horasCatedra * reglas.puntosPorHora : 0
  const puntosPorParcial = materia.cantidadParciales ? Math.round((poolBase / materia.cantidadParciales) * 100) / 100 : 0
  const tieneOverrides =
    materia.notaAprobacionOverride != null || materia.notaPromocionOverride != null || materia.permitePromocionOverride != null

  return (
    <>
      <p className="editar-materia-subtitulo">{materia.nombre}</p>

      <label className="editar-materia-campo">
        <span className="editar-materia-label">Nombre</span>
        <input
          type="text"
          className="editar-materia-input"
          value={materia.nombre}
          onChange={(e) => onEditarCampo('nombre', e.target.value)}
        />
      </label>

      <div className="editar-materia-campo">
        <div className="editar-materia-campo-cabecera">
          <span className="editar-materia-label">Horas cátedra</span>
          <Stepper
            campo="horasCatedra"
            valor={materia.horasCatedra ?? RANGOS.horasCatedra.min}
            onCambiar={(valor) => onEditarCampo('horasCatedra', valor)}
          />
        </div>
        <p className="editar-materia-ayuda">Definen el pool: {poolBase} pts</p>
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
        <p className="editar-materia-ayuda">Cada uno vale {puntosPorParcial} pts</p>
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
        <p className="editar-materia-ayuda">Aplica a todos los parciales por igual.</p>
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
          <span className="editar-materia-ayuda">
            {reglas.permitePromocion ? 'La materia puede promocionar sin final.' : 'La materia siempre va a final.'}
          </span>
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
        <div className="editar-materia-campo">
          <span className="editar-materia-label">Nota de promoción</span>
          <GrillaNotaChica
            valores={NOTAS_PROMOCION}
            seleccionado={reglas.notaPromocion}
            onElegir={(valor) => onOverrideNumero('notaPromocionOverride', valor)}
          />
        </div>
      )}

      <div className="editar-materia-forzar">
        <span className="editar-materia-label">Forzar resultado</span>
        <p className="editar-materia-ayuda">Si el profesor decide por fuera de la regla, marcalo acá.</p>
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
