-- facu_puntos — Fase 2: carga el catálogo de UTN Ingeniería Industrial.
-- Corré este script completo en el SQL Editor de Supabase.
-- Es seguro correrlo más de una vez: no duplica la carrera ni las materias
-- si ya están cargadas.

-- 1) Carrera: solo se inserta si todavía no existe una fila con esa
-- universidad + nombre (misma universidad puede tener nombres repetidos con
-- otras, por eso se filtra por los dos campos, no solo por nombre).
insert into carreras (universidad, nombre, nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora)
select 'UTN', 'Ingeniería Industrial', 6, 8, true, 1
where not exists (
  select 1 from carreras where universidad = 'UTN' and nombre = 'Ingeniería Industrial'
);

-- 2) Catálogo de materias: solo se carga si esa carrera todavía no tiene
-- ninguna materia cargada. cantidad_parciales/recuperatorios/instancias_final
-- usan los defaults de la tabla (2, 2, 4) — no hace falta especificarlos.
-- Sin Práctica Profesional Supervisada (PPS). Las electivas van como un solo
-- bloque por nivel con el total de horas de ese bloque.
do $$
declare
  v_carrera_id uuid;
begin
  select id into v_carrera_id
  from carreras
  where universidad = 'UTN' and nombre = 'Ingeniería Industrial';

  if v_carrera_id is null then
    raise notice 'No se encontró la carrera "Ingeniería Industrial" (UTN): no se cargan materias.';
    return;
  end if;

  if exists (select 1 from materias_catalogo where carrera_id = v_carrera_id) then
    raise notice 'Esa carrera ya tiene materias cargadas: no se vuelve a cargar el catálogo.';
    return;
  end if;

  insert into materias_catalogo (carrera_id, nombre, anio_cursada, horas_catedra) values
    -- 1er Nivel
    (v_carrera_id, 'Análisis Matemático I', 1, 160),
    (v_carrera_id, 'Química General', 1, 160),
    (v_carrera_id, 'Álgebra y Geometría Analítica', 1, 160),
    (v_carrera_id, 'Física I', 1, 160),
    (v_carrera_id, 'Sistemas de Representación', 1, 96),
    (v_carrera_id, 'Ingeniería y Sociedad', 1, 64),
    (v_carrera_id, 'Pensamiento Sistémico (Integradora)', 1, 96),
    (v_carrera_id, 'Informática I', 1, 96),

    -- 2do Nivel
    (v_carrera_id, 'Administración General (Integradora)', 2, 128),
    (v_carrera_id, 'Análisis Matemático II', 2, 160),
    (v_carrera_id, 'Ciencia de los Materiales', 2, 128),
    (v_carrera_id, 'Física II', 2, 160),
    (v_carrera_id, 'Economía General', 2, 128),
    (v_carrera_id, 'Probabilidad y Estadística', 2, 96),
    (v_carrera_id, 'Inglés I', 2, 64),
    (v_carrera_id, 'Informática II', 2, 96),

    -- 3er Nivel
    (v_carrera_id, 'Estudio del Trabajo (Integradora)', 3, 128),
    (v_carrera_id, 'Electrotecnia y Máquinas Eléctricas', 3, 160),
    (v_carrera_id, 'Economía de la Empresa', 3, 96),
    (v_carrera_id, 'Estática y Resistencia de Materiales', 3, 128),
    (v_carrera_id, 'Costos y Presupuestos', 3, 96),
    (v_carrera_id, 'Mecánica de los Fluidos', 3, 96),
    (v_carrera_id, 'Análisis Numérico y Cálculo Avanzado', 3, 64),
    (v_carrera_id, 'Comercialización', 3, 96),
    (v_carrera_id, 'Termodinámica y Máquinas Térmicas', 3, 128),

    -- 4to Nivel
    (v_carrera_id, 'Evaluación de Proyectos (Integradora)', 4, 160),
    (v_carrera_id, 'Instalaciones Industriales', 4, 96),
    (v_carrera_id, 'Investigación Operativa', 4, 128),
    (v_carrera_id, 'Planificación y Control de la Producción', 4, 128),
    (v_carrera_id, 'Seguridad, Higiene e Ingeniería Ambiental', 4, 96),
    (v_carrera_id, 'Ingeniería en Calidad', 4, 96),
    (v_carrera_id, 'Procesos Industriales', 4, 160),
    (v_carrera_id, 'Mecánica y Mecanismos', 4, 96),
    (v_carrera_id, 'Legislación', 4, 64),
    (v_carrera_id, 'Inglés II', 4, 64),

    -- 5to Nivel
    (v_carrera_id, 'Control de Gestión', 5, 96),
    (v_carrera_id, 'Manejo de Materiales y Distribución en Planta', 5, 96),
    (v_carrera_id, 'Diseño de Producto', 5, 64),
    (v_carrera_id, 'Comercio Exterior', 5, 96),
    (v_carrera_id, 'Mantenimiento', 5, 96),
    (v_carrera_id, 'Relaciones Industriales', 5, 96),
    (v_carrera_id, 'Proyecto Final (Integradora)', 5, 192),
    (v_carrera_id, 'Electivas (bloque) — 5to Nivel', 5, 160);
end $$;
