import './ExplicacionPuntos.css'

function ExplicacionPuntos({ reglasCarrera }) {
  const { notaAprobacion, notaPromocion, puntosPorHora } = reglasCarrera

  return (
    <details className="explicacion-puntos">
      <summary>¿Cómo se calculan los puntos?</summary>
      <div className="explicacion-puntos-contenido">
        <p>
          Cada materia tiene un <strong>pool de puntos</strong> igual a sus horas cátedra × {puntosPorHora} pt
          {puntosPorHora === 1 ? '' : 's'} por hora (según tu carrera).
        </p>
        <p>
          Ese pool se reparte en partes iguales entre los parciales de la materia. Aprobar cada parcial (con{' '}
          {notaAprobacion}+ en cualquier instancia, incluyendo recuperatorios) suma esa parte, sin importar si hizo
          falta recuperatorio para lograrlo.
        </p>
        <p>
          Al aprobar la materia completa se suma un bonus extra sobre el pool: <strong>+50%</strong> si
          promocionaste (con {notaPromocion}+ en el patrón de promoción), o <strong>+25%</strong> si aprobaste por
          firma + final.
        </p>
        <p>Si una materia se recursa, deja de aportar puntos — no resta lo que ya ganaste en las demás.</p>
      </div>
    </details>
  )
}

export default ExplicacionPuntos
