-- facu_puntos — Fase 2: carga el catálogo de UBA Licenciatura en Administración.
-- Corré este script completo en el SQL Editor de Supabase.
-- Es seguro correrlo más de una vez: no duplica la carrera ni las materias
-- si ya están cargadas.

-- 1) Carrera: solo se inserta si todavía no existe una fila con esa
-- universidad + nombre.
insert into carreras (universidad, nombre, nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora)
select 'UBA', 'Licenciatura en Administración', 6, 8, true, 1
where not exists (
  select 1 from carreras where universidad = 'UBA' and nombre = 'Licenciatura en Administración'
);

-- 2) Catálogo de materias: solo se carga si esa carrera todavía no tiene
-- ninguna materia cargada. cantidad_parciales/recuperatorios/instancias_final
-- usan los defaults de la tabla (2, 2, 4) — no hace falta especificarlos.
-- Sin Práctica Profesional (260 hs): no encaja en el modelo de
-- parciales/final, mismo criterio que la PPS de UTN. Las electivas van como
-- un solo bloque con el total de horas del Ciclo Profesional Orientado.
-- El año de cursada es una estimación en base a correlatividades (la fuente
-- oficial agrupa por ciclo, no por año) — se puede ajustar más adelante.
do $$
declare
  v_carrera_id uuid;
begin
  select id into v_carrera_id
  from carreras
  where universidad = 'UBA' and nombre = 'Licenciatura en Administración';

  if v_carrera_id is null then
    raise notice 'No se encontró la carrera "Licenciatura en Administración" (UBA): no se cargan materias.';
    return;
  end if;

  if exists (select 1 from materias_catalogo where carrera_id = v_carrera_id) then
    raise notice 'Esa carrera ya tiene materias cargadas: no se vuelve a cargar el catálogo.';
    return;
  end if;

  insert into materias_catalogo (carrera_id, nombre, anio_cursada, horas_catedra) values
    -- Año 1
    (v_carrera_id, 'Análisis Matemático', 1, 108),
    (v_carrera_id, 'Economía', 1, 72),
    (v_carrera_id, 'Historia Económica y Social General', 1, 72),
    (v_carrera_id, 'Álgebra', 1, 72),
    (v_carrera_id, 'Administración General', 1, 72),
    (v_carrera_id, 'Sociología de las Organizaciones', 1, 72),

    -- Año 2
    (v_carrera_id, 'Teoría Contable', 2, 108),
    (v_carrera_id, 'Estadística I', 2, 108),
    (v_carrera_id, 'Microeconomía I', 2, 72),
    (v_carrera_id, 'Derecho Empresarial', 2, 72),
    (v_carrera_id, 'Sistemas Administrativos', 2, 72),
    (v_carrera_id, 'Gestión de Tecnologías Digitales', 2, 72),
    (v_carrera_id, 'Cálculo Financiero', 2, 72),
    (v_carrera_id, 'Gestión del Talento', 2, 108),

    -- Año 3
    (v_carrera_id, 'Gestión de Costos', 3, 72),
    (v_carrera_id, 'Macroeconomía y Política Económica', 3, 108),
    (v_carrera_id, 'Administración Financiera', 3, 108),
    (v_carrera_id, 'Métodos Predictivos para la Gestión', 3, 72),
    (v_carrera_id, 'Administración de Operaciones', 3, 108),

    -- Año 4
    (v_carrera_id, 'Administración Tributaria', 4, 72),
    (v_carrera_id, 'Marketing', 4, 108),
    (v_carrera_id, 'Ciencias de la Decisión', 4, 108),
    (v_carrera_id, 'Planeamiento Estratégico', 4, 108),

    -- Año 5
    (v_carrera_id, 'Dirección', 5, 108),
    (v_carrera_id, 'Electivas (bloque) — Ciclo Profesional Orientado', 5, 216);
end $$;
