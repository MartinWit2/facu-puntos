import { useState } from 'react'
import HistorialCanjes from '../components/HistorialCanjes.jsx'
import PremioForm from '../components/PremioForm.jsx'
import PremioList from '../components/PremioList.jsx'
import { useCanjes } from '../hooks/useCanjes.js'
import { useMaterias } from '../hooks/useMaterias.js'
import { usePremios } from '../hooks/usePremios.js'
import { calcularSaldoDisponible } from '../utils/canjes'
import { calcularPuntosTotales } from '../utils/puntosMateria'
import './Premios.css'

function Premios() {
  const { materias } = useMaterias()
  const { premios, agregarPremio, editarPremio, eliminarPremio } = usePremios()
  const { canjes, agregarCanje } = useCanjes()

  const [premioEditandoId, setPremioEditandoId] = useState(null)
  const [formularioAbierto, setFormularioAbierto] = useState(false)

  const puntosTotales = calcularPuntosTotales(materias)
  const saldoDisponible = calcularSaldoDisponible(puntosTotales, canjes)

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

  const handleCanjear = (premio) => {
    if (saldoDisponible < premio.costoPuntos) return
    agregarCanje(premio)
  }

  return (
    <section className="page">
      <h1>Premios</h1>

      <div className={saldoDisponible < 0 ? 'saldo-card saldo-negativo' : 'saldo-card'}>
        <span className="saldo-label">Saldo disponible</span>
        <span className="saldo-valor">{saldoDisponible} pts</span>
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
        onIniciarEdicion={handleIniciarEdicion}
        onGuardarEdicion={handleGuardarEdicion}
        onCancelarEdicion={handleCancelarEdicion}
        onEliminar={handleEliminar}
        onCanjear={handleCanjear}
      />

      <section className="premio-seccion">
        <h2>Historial de canjes</h2>
        <HistorialCanjes canjes={canjes} />
      </section>
    </section>
  )
}

export default Premios
