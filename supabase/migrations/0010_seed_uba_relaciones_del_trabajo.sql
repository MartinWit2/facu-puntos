-- facu_puntos — carga el catálogo de UBA Licenciatura en Relaciones del Trabajo.
-- Corré este script completo en el SQL Editor de Supabase.
-- Es seguro correrlo más de una vez: no duplica la carrera ni las materias
-- si ya están cargadas.

-- 1) Carrera: solo se inserta si todavía no existe una fila con esa
-- universidad + nombre.
insert into carreras (universidad, nombre, nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora)
select 'UBA', 'Licenciatura en Relaciones del Trabajo', 6, 8, true, 1
where not exists (
  select 1 from carreras where universidad = 'UBA' and nombre = 'Licenciatura en Relaciones del Trabajo'
);

-- 2) Catálogo de materias: solo se carga si esa carrera todavía no tiene
-- ninguna materia cargada. cantidad_parciales/recuperatorios/instancias_final
-- usan los defaults de la tabla (2, 2, 4) — no hace falta especificarlos.
-- Sin los niveles de Inglés (agregado optativo de la carrera, no parte del
-- plan obligatorio). Las optativas van como un solo bloque con el total de
-- horas indicado.
do $$
declare
  v_carrera_id uuid;
begin
  select id into v_carrera_id
  from carreras
  where universidad = 'UBA' and nombre = 'Licenciatura en Relaciones del Trabajo';

  if v_carrera_id is null then
    raise notice 'No se encontró la carrera "Licenciatura en Relaciones del Trabajo" (UBA): no se cargan materias.';
    return;
  end if;

  if exists (select 1 from materias_catalogo where carrera_id = v_carrera_id) then
    raise notice 'Esa carrera ya tiene materias cargadas: no se vuelve a cargar el catálogo.';
    return;
  end if;

  insert into materias_catalogo (carrera_id, nombre, anio_cursada, horas_catedra) values
    -- Año 1 (Ciclo Básico Común)
    (v_carrera_id, 'Introducción al Pensamiento Científico', 1, 90),
    (v_carrera_id, 'Introducción al Conocimiento de la Sociedad y el Estado', 1, 90),
    (v_carrera_id, 'Sociología', 1, 90),
    (v_carrera_id, 'Ciencia Política', 1, 90),
    (v_carrera_id, 'Psicología', 1, 90),
    (v_carrera_id, 'Economía', 1, 90),

    -- Año 2
    (v_carrera_id, 'Principios de Sociología del Trabajo', 2, 60),
    (v_carrera_id, 'Economía Política I', 2, 60),
    (v_carrera_id, 'Administración de Empresas', 2, 60),
    (v_carrera_id, 'Administración de Personal I', 2, 60),
    (v_carrera_id, 'Derecho del Trabajo I', 2, 60),
    (v_carrera_id, 'Estadística Aplicada I', 2, 60),

    -- Año 3
    (v_carrera_id, 'Economía Política II', 3, 60),
    (v_carrera_id, 'Estadística Aplicada II', 3, 60),
    (v_carrera_id, 'Economía del Trabajo', 3, 60),
    (v_carrera_id, 'Historia Social Contemporánea', 3, 60),
    (v_carrera_id, 'Derecho del Trabajo II', 3, 60),
    (v_carrera_id, 'Administración de Personal II', 3, 60),
    (v_carrera_id, 'Administración de Personal III', 3, 60),
    (v_carrera_id, 'Computación y Sistemas de Información', 3, 60),

    -- Año 4
    (v_carrera_id, 'Psicología del Trabajo', 4, 60),
    (v_carrera_id, 'Relaciones del Trabajo', 4, 60),
    (v_carrera_id, 'Estructura Económica y Social', 4, 60),
    (v_carrera_id, 'Derecho Administrativo y Procesal del Trabajo', 4, 60),
    (v_carrera_id, 'Condiciones y Medio Ambiente de Trabajo', 4, 60),
    (v_carrera_id, 'Sociología del Trabajo', 4, 60),

    -- Año 5
    (v_carrera_id, 'Derecho de la Seguridad Social', 5, 60),
    (v_carrera_id, 'Teoría y Comportamiento Organizacional', 5, 60),
    (v_carrera_id, 'Historia del Movimiento Obrero Nacional e Internacional', 5, 60),
    (v_carrera_id, 'Metodología de la Investigación y de la Evaluación', 5, 60),
    (v_carrera_id, 'Optativas (bloque) — 5to Año', 5, 90);
end $$;
