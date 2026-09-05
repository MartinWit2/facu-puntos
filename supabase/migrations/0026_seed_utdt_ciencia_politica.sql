-- facu_puntos — carga UTDT Licenciatura en Ciencia Política y Gobierno como
-- DOS carreras separadas por orientación (Ciencia Política y Gestión
-- Pública): bifurcan en 4to año con materias obligatorias distintas, no es
-- una simple elección de electivas, así que no encajan en una sola fila de
-- `carreras` con el esquema actual. Comparten idéntico el tronco común de
-- los primeros 3 años, duplicado en las dos.
-- Corré este script completo en el SQL Editor de Supabase. Es seguro
-- correrlo más de una vez: cada carrera se chequea por separado
-- (universidad + nombre) y no duplica ni la carrera ni sus materias si ya
-- están cargadas.
--
-- Reglas y puntos: defaults en las dos (nota_aprobacion 6, nota_promocion
-- 8, permite_promocion true, puntos_por_hora 1, parciales/recup/final en
-- los defaults de la tabla 2/2/4). Misma regla institucional de horas ya
-- validada en UTDT Administración/Economía: 102 hs/semestre en 1er año, 68
-- hs/semestre del 2do en adelante.


-- ============================================================
-- Carrera 1: UTDT — Licenciatura en Ciencia Política y Gobierno
-- (Orientación Ciencia Política)
-- Excluido Seminario de Graduación (tesina de cierre, mismo criterio que
-- Administración/Economía de esta universidad). Los 4 "Curso de Campo
-- Menor" son cada uno un casillero electivo individual (entre +25
-- disponibles) — se cargan como 4 filas, mismo criterio que UTDT Economía.
-- ============================================================
insert into carreras (universidad, nombre, nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora)
select 'UTDT', 'Licenciatura en Ciencia Política y Gobierno (Orientación Ciencia Política)', 6, 8, true, 1
where not exists (
  select 1 from carreras
  where universidad = 'UTDT' and nombre = 'Licenciatura en Ciencia Política y Gobierno (Orientación Ciencia Política)'
);

do $$
declare
  v_carrera_id uuid;
begin
  select id into v_carrera_id from carreras
  where universidad = 'UTDT' and nombre = 'Licenciatura en Ciencia Política y Gobierno (Orientación Ciencia Política)';

  if v_carrera_id is null then
    raise notice 'No se encontró la orientación Ciencia Política (UTDT): no se cargan materias.';
    return;
  end if;

  if exists (select 1 from materias_catalogo where carrera_id = v_carrera_id) then
    raise notice 'UTDT Ciencia Política (orientación Ciencia Política) ya tiene materias cargadas: no se vuelve a cargar.';
    return;
  end if;

  insert into materias_catalogo (carrera_id, nombre, anio_cursada, horas_catedra) values
    -- Año 1 (102 hs c/u)
    (v_carrera_id, 'Introducción a la Ciencia Política', 1, 102),
    (v_carrera_id, 'Introducción a las Relaciones Internacionales', 1, 102),
    (v_carrera_id, 'Economía I', 1, 102),
    (v_carrera_id, 'Matemática I', 1, 102),
    (v_carrera_id, 'Comprensión de Textos y Escritura', 1, 102),
    (v_carrera_id, 'Teoría Política I', 1, 102),
    (v_carrera_id, 'Lógica y Técnicas de Investigación en Ciencias Sociales', 1, 102),
    (v_carrera_id, 'Historia de Occidente a partir de la Modernidad', 1, 102),
    (v_carrera_id, 'Matemática II', 1, 102),

    -- Año 2 (68 hs c/u)
    (v_carrera_id, 'Política Comparada', 2, 68),
    (v_carrera_id, 'Política y Sociedad en la Argentina (Siglos XIX y XX)', 2, 68),
    (v_carrera_id, 'Historia del Mundo Contemporáneo (1914-2000)', 2, 68),
    (v_carrera_id, 'Economía II', 2, 68),
    (v_carrera_id, 'Introducción a las Políticas Públicas', 2, 68),
    (v_carrera_id, 'Política y Sociedad en América Latina', 2, 68),
    (v_carrera_id, 'Teoría Política II', 2, 68),
    (v_carrera_id, 'Teoría de las Relaciones Internacionales', 2, 68),

    -- Año 3 (68 hs c/u)
    (v_carrera_id, 'Diseño y Metodología de las Ciencias Sociales', 3, 68),
    (v_carrera_id, 'Organizaciones y Teoría de la Decisión', 3, 68),
    (v_carrera_id, 'Política y Economía', 3, 68),
    (v_carrera_id, 'Estructura Social y Demografía', 3, 68),
    (v_carrera_id, 'Expresión Oral y Escrita', 3, 68),
    (v_carrera_id, 'Estadística para las Ciencias Sociales', 3, 68),
    (v_carrera_id, 'Política y Derecho', 3, 68),
    (v_carrera_id, 'Política y Comunicación', 3, 68),
    (v_carrera_id, 'Estado y Políticas Públicas en la Argentina', 3, 68),

    -- Año 4 (68 hs c/u) — orientación Ciencia Política
    (v_carrera_id, 'Finanzas Públicas', 4, 68),
    (v_carrera_id, 'Política Económica Argentina', 4, 68),
    (v_carrera_id, 'Curso de Campo Menor 1 (electivo)', 4, 68),
    (v_carrera_id, 'Curso de Campo Menor 2 (electivo)', 4, 68),
    (v_carrera_id, 'Tópicos de Teoría Política Social', 4, 68),
    (v_carrera_id, 'Actores y Procesos Políticos', 4, 68),
    (v_carrera_id, 'Curso de Campo Menor 3 (electivo)', 4, 68),
    (v_carrera_id, 'Curso de Campo Menor 4 (electivo)', 4, 68);
end $$;


-- ============================================================
-- Carrera 2: UTDT — Licenciatura en Ciencia Política y Gobierno
-- (Orientación Gestión Pública)
-- Primeros 3 años idénticos a la Carrera 1 (mismo tronco común), repetidos
-- acá como filas propias porque cada carrera tiene su propio catálogo.
-- Excluido Seminario de Graduación, mismo criterio que la Carrera 1.
-- ============================================================
insert into carreras (universidad, nombre, nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora)
select 'UTDT', 'Licenciatura en Ciencia Política y Gobierno (Orientación Gestión Pública)', 6, 8, true, 1
where not exists (
  select 1 from carreras
  where universidad = 'UTDT' and nombre = 'Licenciatura en Ciencia Política y Gobierno (Orientación Gestión Pública)'
);

do $$
declare
  v_carrera_id uuid;
begin
  select id into v_carrera_id from carreras
  where universidad = 'UTDT' and nombre = 'Licenciatura en Ciencia Política y Gobierno (Orientación Gestión Pública)';

  if v_carrera_id is null then
    raise notice 'No se encontró la orientación Gestión Pública (UTDT): no se cargan materias.';
    return;
  end if;

  if exists (select 1 from materias_catalogo where carrera_id = v_carrera_id) then
    raise notice 'UTDT Ciencia Política (orientación Gestión Pública) ya tiene materias cargadas: no se vuelve a cargar.';
    return;
  end if;

  insert into materias_catalogo (carrera_id, nombre, anio_cursada, horas_catedra) values
    -- Año 1 (102 hs c/u) — tronco común, idéntico a la Carrera 1
    (v_carrera_id, 'Introducción a la Ciencia Política', 1, 102),
    (v_carrera_id, 'Introducción a las Relaciones Internacionales', 1, 102),
    (v_carrera_id, 'Economía I', 1, 102),
    (v_carrera_id, 'Matemática I', 1, 102),
    (v_carrera_id, 'Comprensión de Textos y Escritura', 1, 102),
    (v_carrera_id, 'Teoría Política I', 1, 102),
    (v_carrera_id, 'Lógica y Técnicas de Investigación en Ciencias Sociales', 1, 102),
    (v_carrera_id, 'Historia de Occidente a partir de la Modernidad', 1, 102),
    (v_carrera_id, 'Matemática II', 1, 102),

    -- Año 2 (68 hs c/u) — tronco común
    (v_carrera_id, 'Política Comparada', 2, 68),
    (v_carrera_id, 'Política y Sociedad en la Argentina (Siglos XIX y XX)', 2, 68),
    (v_carrera_id, 'Historia del Mundo Contemporáneo (1914-2000)', 2, 68),
    (v_carrera_id, 'Economía II', 2, 68),
    (v_carrera_id, 'Introducción a las Políticas Públicas', 2, 68),
    (v_carrera_id, 'Política y Sociedad en América Latina', 2, 68),
    (v_carrera_id, 'Teoría Política II', 2, 68),
    (v_carrera_id, 'Teoría de las Relaciones Internacionales', 2, 68),

    -- Año 3 (68 hs c/u) — tronco común
    (v_carrera_id, 'Diseño y Metodología de las Ciencias Sociales', 3, 68),
    (v_carrera_id, 'Organizaciones y Teoría de la Decisión', 3, 68),
    (v_carrera_id, 'Política y Economía', 3, 68),
    (v_carrera_id, 'Estructura Social y Demografía', 3, 68),
    (v_carrera_id, 'Expresión Oral y Escrita', 3, 68),
    (v_carrera_id, 'Estadística para las Ciencias Sociales', 3, 68),
    (v_carrera_id, 'Política y Derecho', 3, 68),
    (v_carrera_id, 'Política y Comunicación', 3, 68),
    (v_carrera_id, 'Estado y Políticas Públicas en la Argentina', 3, 68),

    -- Año 4 (68 hs c/u) — distinto de la Carrera 1, orientación Gestión Pública
    (v_carrera_id, 'Finanzas Públicas', 4, 68),
    (v_carrera_id, 'Política Económica Argentina', 4, 68),
    (v_carrera_id, 'Estructura del Sector Público', 4, 68),
    (v_carrera_id, 'Policy Lab: Políticas Públicas Sectoriales', 4, 68),
    (v_carrera_id, 'Políticas Públicas Comparadas', 4, 68),
    (v_carrera_id, 'Evaluación de Políticas Públicas', 4, 68),
    (v_carrera_id, 'Comportamiento Organizacional', 4, 68),
    (v_carrera_id, 'Electiva (E-Government y Transparencia Pública o Datos para Cientistas Sociales, a elección)', 4, 68);
end $$;
