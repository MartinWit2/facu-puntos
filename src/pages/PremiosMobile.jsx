import { useState } from 'react'
import BottomSheet from '../components/BottomSheet.jsx'
import { useCelebracion } from '../components/Celebracion.jsx'
import HistorialCanjes from '../components/HistorialCanjes.jsx'
import HojaCanje from '../components/HojaCanje.jsx'
import PremioForm from '../components/PremioForm.jsx'
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
  const [formularioAbierto, setFormularioAbierto] = useState(false)
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
    setFormularioAbierto(true)
  }

  const handleSubmitAgregar = (datos) => {
    agregarPremio(datos)
    setFormularioAbierto(false)
  }

  const handleIniciarEdicion = (premio) => {
    setFormularioAbierto(false)
    setPremioEditandoId(premio.id)
  }

  const handleGuardarEdicion = (datos) => {
    editarPremio(premioEditandoId, datos)
    setPremioEditandoId(null)
  }

  const handleEliminar = (id) => {
    if (premioEditandoId === id) setPremioEditandoId(null)
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

      {!formularioAbierto && (
        <button type="button" className="boton-primario-mobile premios-mobile-agregar" onClick={handleAgregarClick}>
          + Agregar premio
        </button>
      )}

      {formularioAbierto && (
        <div className="premio-form-card">
          <h2>Agregar premio</h2>
          <PremioForm
            key="nuevo"
            categoriasExistentes={categoriasExistentes}
            rangoPool={rangoPool}
            submitLabel="Agregar premio"
            onSubmit={handleSubmitAgregar}
            onCancel={() => setFormularioAbierto(false)}
          />
        </div>
      )}

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
                if (premio.id === premioEditandoId) {
                  return (
                    <div key={premio.id} className="premio-card premio-card-editando">
                      <PremioForm
                        valoresIniciales={premio}
                        categoriasExistentes={categoriasExistentes}
                        rangoPool={rangoPool}
                        submitLabel="Guardar cambios"
                        onSubmit={handleGuardarEdicion}
                        onCancel={() => setPremioEditandoId(null)}
                      />
                    </div>
                  )
                }

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
