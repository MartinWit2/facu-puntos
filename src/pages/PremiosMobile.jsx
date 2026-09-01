import { useState } from 'react'
import { Link } from 'react-router-dom'
import BottomSheet from '../components/BottomSheet.jsx'
import { useCelebracion } from '../components/Celebracion.jsx'
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
  const { celebrar, elemento: celebracion } = useCelebracion()

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
    setPremioDraft({ nombre: '', categoria: '', costoPuntos: COSTO_PREMIO_DEFAULT, imagenUrl: null })
  }

  const handleIniciarEdicion = (premio) => {
    setPremioEditandoId(premio.id)
    setPremioDraft({
      nombre: premio.nombre,
      categoria: premio.categoria,
      costoPuntos: premio.costoPuntos,
      imagenUrl: premio.imagenUrl ?? null,
    })
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
      imagenUrl: premioDraft.imagenUrl ?? null,
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

  const handleConfirmarCanje = (detalleOrigen, fotoUrl) => {
    agregarCanje(premioEnCanje, detalleOrigen, fotoUrl)
    const saldoNuevo = Math.round((saldoDisponible - premioEnCanje.costoPuntos) * 100) / 100
    celebrar({
      icono: 'redeem',
      titulo: premioEnCanje.nombre,
      subtitulo: `Canjeaste ${premioEnCanje.costoPuntos} pts. Te quedan ${saldoNuevo} disponibles.`,
      boton: 'Listo',
    })
    setCanjeSheetId(null)
  }

  const grupos = agruparPorCategoria(premios)

  return (
    <section className="page-mobile premios-mobile">
      {celebracion}
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
                    {premio.imagenUrl ? (
                      <img src={premio.imagenUrl} alt="" className="premio-fila-mobile-imagen" />
                    ) : (
                      <span className="premio-fila-mobile-imagen-vacia" aria-hidden="true">
                        <span className="material-symbols-outlined">redeem</span>
                      </span>
                    )}
                    <div className="premio-fila-mobile-info">
                      <span className="premio-fila-mobile-nombre" title={premio.nombre}>
                        {premio.nombre}
                      </span>
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
                        <button
                          type="button"
                          className="premio-fila-mobile-editar"
                          onClick={() => handleIniciarEdicion(premio)}
                          aria-label="Editar premio"
                        >
                          <span className="material-symbols-outlined" aria-hidden="true">
                            edit
                          </span>
                        </button>
                        <button
                          type="button"
                          className="premio-fila-mobile-editar"
                          onClick={() => setConfirmandoEliminarId(premio.id)}
                          aria-label="Eliminar premio"
                        >
                          <span className="material-symbols-outlined" aria-hidden="true">
                            delete
                          </span>
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

      <Link to="/historial-canjes" className="premios-mobile-historial-fila">
        <span className="material-symbols-outlined" aria-hidden="true">
          receipt_long
        </span>
        <span className="premios-mobile-historial-texto">
          <span className="premios-mobile-historial-titulo">Historial de canjes</span>
          <span className="premios-mobile-historial-resumen">
            {canjes.filter((c) => !c.oculto).length} canje{canjes.filter((c) => !c.oculto).length === 1 ? '' : 's'}
          </span>
        </span>
        <span className="material-symbols-outlined premios-mobile-historial-chevron" aria-hidden="true">
          chevron_right
        </span>
      </Link>

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
    </section>
  )
}

export default PremiosMobile
