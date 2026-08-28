import { useState } from 'react'
import { useCelebracion } from '../components/Celebracion.jsx'
import HistorialCanjes from '../components/HistorialCanjes.jsx'
import PremioForm from '../components/PremioForm.jsx'
import PremioList from '../components/PremioList.jsx'
import { usePerfil } from '../context/usePerfil.js'
import { useCanjes } from '../hooks/useCanjes.js'
import { useMaterias } from '../hooks/useMaterias.js'
import { usePremios } from '../hooks/usePremios.js'
import { calcularSaldoDisponible, canjesDesde } from '../utils/canjes'
import { calcularPoolPuntos } from '../utils/puntos'
import { calcularOrigenesDisponibles, calcularPuntosTotales } from '../utils/puntosMateria'
import { calcularReglasEfectivas } from '../utils/reglasMateria'
import './Premios.css'

function Premios() {
  const { materias, cargando: cargandoMaterias } = useMaterias()
  const { premios, cargando: cargandoPremios, agregarPremio, editarPremio, eliminarPremio } = usePremios()
  const { canjes, cargando: cargandoCanjes, agregarCanje, ocultarHistorialCanjes } = useCanjes()
  const { perfil, reglasCarrera } = usePerfil()

  const [premioEditandoId, setPremioEditandoId] = useState(null)
  const [formularioAbierto, setFormularioAbierto] = useState(false)
  const { celebrar, elemento: celebracion } = useCelebracion()

  const cargando = cargandoMaterias || cargandoPremios || cargandoCanjes

  // Los canjes de una carrera anterior (si el usuario cambió de carrera) no
  // cuentan contra el saldo actual — el historial de abajo los sigue
  // mostrando a todos igual.
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

  const handleCancelarAgregar = () => setFormularioAbierto(false)

  const handleSubmitAgregar = (datos) => {
    agregarPremio(datos)
    setFormularioAbierto(false)
  }

  // La edición se muestra "in place", en la propia tarjeta del premio dentro
  // de la lista, así no hace falta volver arriba de la pantalla.
  const handleIniciarEdicion = (premio) => {
    setFormularioAbierto(false)
    setPremioEditandoId(premio.id)
  }

  const handleCancelarEdicion = () => setPremioEditandoId(null)

  const handleGuardarEdicion = (datos) => {
    editarPremio(premioEditandoId, datos)
    setPremioEditandoId(null)
  }

  const handleEliminar = (id) => {
    if (premioEditandoId === id) setPremioEditandoId(null)
    eliminarPremio(id)
  }

  const handleCanjear = (premio, detalleOrigen) => {
    agregarCanje(premio, detalleOrigen)
    celebrar()
  }

  if (cargando) {
    return (
      <section className="page">
        <h1>Premios</h1>
        <p className="page-placeholder">Cargando…</p>
      </section>
    )
  }

  return (
    <section className="page">
      {celebracion}
      <h1>Premios</h1>

      <div className={saldoDisponible < 0 ? 'saldo-card saldo-negativo' : 'saldo-card'}>
        <span className="saldo-label">Saldo disponible</span>
        <span className="saldo-valor">
          <span aria-hidden="true">🪙</span> {saldoDisponible} pts
        </span>
        <span className="saldo-detalle">
          {puntosTotales} pts ganados − {Math.round((puntosTotales - saldoDisponible) * 100) / 100} pts canjeados
        </span>
      </div>

      {!formularioAbierto && (
        <button type="button" className="btn-agregar-premio" onClick={handleAgregarClick}>
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
            onCancel={handleCancelarAgregar}
          />
        </div>
      )}

      <PremioList
        premios={premios}
        saldoDisponible={saldoDisponible}
        premioEditandoId={premioEditandoId}
        categoriasExistentes={categoriasExistentes}
        rangoPool={rangoPool}
        origenesDisponibles={origenesDisponibles}
        onIniciarEdicion={handleIniciarEdicion}
        onGuardarEdicion={handleGuardarEdicion}
        onCancelarEdicion={handleCancelarEdicion}
        onEliminar={handleEliminar}
        onCanjear={handleCanjear}
      />

      <section className="premio-seccion">
        <h2>Historial de canjes</h2>
        <HistorialCanjes canjes={canjes} onBorrarHistorial={ocultarHistorialCanjes} />
      </section>
    </section>
  )
}

export default Premios
