import { useState } from 'react'
import BottomSheet from '../components/BottomSheet.jsx'
import { useCelebracion } from '../components/Celebracion.jsx'
import HistorialCanjes from '../components/HistorialCanjes.jsx'
import HojaCanje from '../components/HojaCanje.jsx'
import HojaNuevoPremio from '../components/HojaNuevoPremio.jsx'
import { usePerfil } from '../context/usePerfil.js'
import { useCanjes } from '../hooks/useCanjes.js'
import { useMaterias } from '../hooks/useMaterias.js'
import { usePremios } from '../hooks/usePremios.js'
import { calcularSaldoDisponible, canjesDesde } from '../utils/canjes'
import { calcularPoolPuntos } from '../utils/puntos'
import { calcularOrigenesDisponibles, calcularPuntosTotales } from '../utils/puntosMateria'
import { calcularReglasEfectivas } from '../utils/reglasMateria'
import '../pages/Premios.css'
import './PremiosMobile.css'

const COSTO_PREMIO_DEFAULT = 120

function agruparPorCategoria(premios) {
  const grupos = new Map()
  for (const premio of premios) {
    const grupo = grupos.get(premio.categoria) ?? []
    grupo.push(premio)
    grupos.set(premio.categoria, grupo)
  }
  return [...grupos.entries()]
    .sort(([categoriaA], [categoriaB]) => categoriaA.localeCompare(categoriaB))
    .map(([categoria, items]) => [categoria, items.slice().sort((a, b) => a.nombre.localeCompare(b.nombre))])
}

function PremiosMobile() {
  const { materias, cargando: cargandoMaterias } = useMaterias()
  const { premios, cargando: cargandoPremios, agregarPremio, editarPremio, eliminarPremio } = usePremios()
  const { canjes, cargando: cargandoCanjes, agregarCanje } = useCanjes()
  const { perfil, reglasCarrera } = usePerfil()

  const [premioEditandoId, setPremioEditandoId] = useState(null)
  const [premioDraft, setPremioDraft] = useState(null)
  const [confirmandoEliminarId, setConfirmandoEliminarId] = useState(null)
  const [canjeSheetId, setCanjeSheetId] = useState(null)
  const [celebracionCanje, setCelebracionCanje] = useState(null)
  const { celebrar, elemento: confetti } = useCelebracion()

  const cargando = cargandoMaterias || cargandoPremios || cargandoCanjes

  if (cargando) {
    return (
      <section className="page-mobile">
        <h1>Premios</h1>
        <p className="page-placeholder">Cargando…</p>
      </section>
    )
  }

  const canjesCarreraActual = canjesDesde(canjes, perfil?.carrera_desde)
  const puntosTotales = calcularPuntosTotales(materias, reglasCarrera)
  const saldoDisponible = calcularSaldoDisponible(puntosTotales, canjesCarreraActual)
  const origenesDisponibles = calcularOrigenesDisponibles(materias, reglasCarrera, canjesCarreraActual)

  const poolsMaterias = materias.map((m) =>
    calcularPoolPuntos(m.horasCatedra, calcularReglasEfectivas(m, reglasCarrera).puntosPorHora),
  )
  const rangoPool = poolsMaterias.length > 0 ? { min: Math.min(...poolsMaterias), max: Math.max(...poolsMaterias) } : null
  const categoriasExistentes = [...new Set(premios.map((p) => p.categoria))].sort((a, b) => a.localeCompare(b))

  const handleAgregarClick = () => {
    setPremioEditandoId(null)
    setPremioDraft({ nombre: '', categoria: '', costoPuntos: COSTO_PREMIO_DEFAULT })
  }

  const handleIniciarEdicion = (premio) => {
    setPremioEditandoId(premio.id)
    setPremioDraft({ nombre: premio.nombre, categoria: premio.categoria, costoPuntos: premio.costoPuntos })
  }

  const handleCerrarPremioSheet = () => {
    setPremioDraft(null)
    setPremioEditandoId(null)
  }

  const handleCambiarPremioDraft = (campo, valor) => setPremioDraft((prev) => ({ ...prev, [campo]: valor }))

  const handleConfirmarPremio = () => {
    if (!premioDraft.nombre.trim() || !premioDraft.categoria.trim()) return
    const datos = {
      nombre: premioDraft.nombre.trim(),
      categoria: premioDraft.categoria.trim(),
      costoPuntos: premioDraft.costoPuntos,
    }
    if (premioEditandoId) editarPremio(premioEditandoId, datos)
    else agregarPremio(datos)
    handleCerrarPremioSheet()
  }

  const handleEliminar = (id) => {
    if (premioEditandoId === id) handleCerrarPremioSheet()
    eliminarPremio(id)
    setConfirmandoEliminarId(null)
  }

  const premioEnCanje = premios.find((p) => p.id === canjeSheetId)

  const handleConfirmarCanje = (detalleOrigen) => {
    agregarCanje(premioEnCanje, detalleOrigen)
    celebrar()
    setCelebracionCanje({
      nombre: premioEnCanje.nombre,
      costoPuntos: premioEnCanje.costoPuntos,
      saldoNuevo: Math.round((saldoDisponible - premioEnCanje.costoPuntos) * 100) / 100,
    })
    setCanjeSheetId(null)
  }

  const grupos = agruparPorCategoria(premios)

  return (
    <section className="page-mobile premios-mobile">
      {confetti}
      <h1>Premios</h1>
      {/* El saldo ya está siempre visible en el pill del header mobile; acá
          alcanza con "Podés canjearlo"/"Te faltan N pts" por premio, sin
          repetir una tarjeta de saldo (el handoff mobile no la pide en esta
          pantalla, a diferencia de Progreso). */}

      <button type="button" className="boton-primario-mobile premios-mobile-agregar" onClick={handleAgregarClick}>
        + Agregar premio
      </button>

      {premios.length === 0 ? (
        <p className="page-placeholder">Todavía no cargaste ningún premio.</p>
      ) : (
        grupos.map(([categoria, items]) => (
          <section key={categoria} className="mobile-seccion premios-mobile-grupo">
            <div className="premios-mobile-grupo-cabecera">
              <h4 className="premios-mobile-grupo-titulo">{categoria}</h4>
              <span className="premios-mobile-grupo-conteo">{items.length}</span>
            </div>

            <div className="premios-mobile-lista">
              {items.map((premio) => {
                const alcanza = saldoDisponible >= premio.costoPuntos

                return (
                  <div key={premio.id} className="premio-fila-mobile">
                    <div className="premio-fila-mobile-info">
                      <span className="premio-fila-mobile-nombre">{premio.nombre}</span>
                      <span className={alcanza ? 'premio-fila-mobile-estado ok' : 'premio-fila-mobile-estado'}>
                        {alcanza ? 'Podés canjearlo' : `Te faltan ${premio.costoPuntos - saldoDisponible} pts`}
                      </span>
                    </div>

                    {confirmandoEliminarId === premio.id ? (
                      <div className="premio-fila-mobile-confirmar">
                        <span>¿Eliminar?</span>
                        <button type="button" onClick={() => handleEliminar(premio.id)}>
                          Sí
                        </button>
                        <button type="button" onClick={() => setConfirmandoEliminarId(null)}>
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="premio-fila-mobile-acciones">
                        <button
                          type="button"
                          className={alcanza ? 'premio-fila-mobile-costo alcanza' : 'premio-fila-mobile-costo'}
                          disabled={!alcanza}
                          onClick={() => setCanjeSheetId(premio.id)}
                        >
                          {premio.costoPuntos} pts
                        </button>
                        <button type="button" className="premio-fila-mobile-editar" onClick={() => handleIniciarEdicion(premio)}>
                          Editar
                        </button>
                        <button type="button" className="premio-fila-mobile-editar" onClick={() => setConfirmandoEliminarId(premio.id)}>
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ))
      )}

      <section className="mobile-seccion premios-mobile-historial">
        <h4 className="seccion-mobile-label">Historial</h4>
        <HistorialCanjes canjes={canjes} />
      </section>

      <BottomSheet
        abierto={premioEnCanje != null}
        onCerrar={() => setCanjeSheetId(null)}
        titulo={premioEnCanje?.nombre}
      >
        {premioEnCanje && (
          <HojaCanje
            premio={premioEnCanje}
            saldoDisponible={saldoDisponible}
            origenesDisponibles={origenesDisponibles}
            onConfirmar={handleConfirmarCanje}
          />
        )}
      </BottomSheet>

      <BottomSheet
        abierto={premioDraft != null}
        onCerrar={handleCerrarPremioSheet}
        titulo={premioEditandoId ? 'Editar premio' : 'Nuevo premio'}
        altoMax={88}
        footer={
          premioDraft && (
            <button
              type="button"
              className="boton-primario-mobile"
              disabled={!premioDraft.nombre.trim() || !premioDraft.categoria.trim()}
              onClick={handleConfirmarPremio}
            >
              {!premioDraft.nombre.trim() || !premioDraft.categoria.trim()
                ? 'Completá nombre y categoría'
                : premioEditandoId
                  ? 'Guardar cambios'
                  : 'Agregar premio'}
            </button>
          )
        }
      >
        {premioDraft && (
          <HojaNuevoPremio
            form={premioDraft}
            categoriasExistentes={categoriasExistentes}
            rangoPool={rangoPool}
            onCambiar={handleCambiarPremioDraft}
          />
        )}
      </BottomSheet>

      {celebracionCanje && (
        <div className="celebracion-canje-overlay">
          <span className="celebracion-canje-moneda" aria-hidden="true" />
          <h3 className="celebracion-canje-titulo">¡{celebracionCanje.nombre}!</h3>
          <p className="celebracion-canje-subtitulo">
            Canjeaste {celebracionCanje.costoPuntos} pts. Te quedan {celebracionCanje.saldoNuevo} disponibles.
          </p>
          <button type="button" className="celebracion-canje-boton" onClick={() => setCelebracionCanje(null)}>
            Listo
          </button>
        </div>
      )}
    </section>
  )
}

export default PremiosMobile
