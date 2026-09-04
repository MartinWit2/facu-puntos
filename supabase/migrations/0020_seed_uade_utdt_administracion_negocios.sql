-- facu_puntos — carga el catálogo de tres carreras nuevas: UADE
-- Licenciatura en Administración de Empresas, UTDT Licenciado/a en
-- Administración de Empresas, y UADE Licenciatura en Negocios Digitales.
-- Corré este script completo en el SQL Editor de Supabase.
-- Es seguro correrlo más de una vez: cada carrera se chequea por separado
-- (universidad + nombre) y no duplica ni la carrera ni sus materias si ya
-- están cargadas.
--
-- Nota de confianza de los datos: ninguna de las tres tiene fuente 100%
-- oficial para las horas cátedra por materia (no hay un PDF de plan de
-- estudios que las liste una por una) — son patrones fuertes cruzados con
-- varias fuentes, confianza media (media-alta en Negocios Digitales, por
-- tener un dato puntual confirmado — Administración Empresarial I, código
-- de cátedra 1.1.083 — más la validación matemática de 2.720 horas totales
-- del plan ÷ 40 materias = 68 exacto, sin resto). Confirmado con Martin que
-- este nivel de confianza alcanza para cargarlas. Detalle de fuentes en
-- planes-de-estudio-investigacion.md, secciones 7, 8 y 14.
--
-- Reglas y puntos: sin nada que indique valores distintos a los default
-- para ninguna de las tres, así que se cargan con nota_aprobacion 6,
-- nota_promocion 8, permite_promocion true, puntos_por_hora 1, y
-- cantidad_parciales/recuperatorios/instancias_final en los defaults de la
-- tabla (2, 2, 4) — no hace falta especificarlos.


-- ============================================================
-- Carrera 1: UADE — Licenciatura en Administración de Empresas
-- Sin "Trabajo Integrador Final en Administración" (tesina/trabajo final,
-- no una cursada con parciales, y tampoco se consiguió su carga horaria) ni
-- "Examen de Inglés" (examen de nivel de idioma, no una materia cursada) —
-- mismo criterio que la Práctica Profesional Supervisada de UTN.
-- ============================================================
insert into carreras (universidad, nombre, nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora)
select 'UADE', 'Licenciatura en Administración de Empresas', 6, 8, true, 1
where not exists (
  select 1 from carreras where universidad = 'UADE' and nombre = 'Licenciatura en Administración de Empresas'
);

do $$
declare
  v_carrera_id uuid;
begin
  select id into v_carrera_id
  from carreras
  where universidad = 'UADE' and nombre = 'Licenciatura en Administración de Empresas';

  if v_carrera_id is null then
    raise notice 'No se encontró "Licenciatura en Administración de Empresas" (UADE): no se cargan materias.';
    return;
  end if;

  if exists (select 1 from materias_catalogo where carrera_id = v_carrera_id) then
    raise notice 'UADE Administración de Empresas ya tiene materias cargadas: no se vuelve a cargar el catálogo.';
    return;
  end if;

  insert into materias_catalogo (carrera_id, nombre, anio_cursada, horas_catedra) values
    -- Año 1
    (v_carrera_id, 'Administración Empresarial I', 1, 68),
    (v_carrera_id, 'Marketing', 1, 68),
    (v_carrera_id, 'Escritura y Oralidad', 1, 68),
    (v_carrera_id, 'Introducción al Derecho', 1, 68),
    (v_carrera_id, 'Matemática Empresarial I', 1, 68),
    (v_carrera_id, 'Administración Empresarial II', 1, 68),
    (v_carrera_id, 'Estadística Empresarial I', 1, 68),
    (v_carrera_id, 'Gestión de las Personas en las Organizaciones', 1, 68),
    (v_carrera_id, 'Contabilidad I', 1, 68),
    (v_carrera_id, 'Historia Económica Mundial', 1, 68),

    -- Año 2
    (v_carrera_id, 'Microeconomía', 2, 68),
    (v_carrera_id, 'Matemática Empresarial II', 2, 68),
    (v_carrera_id, 'Plataformas y Negocios Web', 2, 68),
    (v_carrera_id, 'Derecho del Trabajo Individual', 2, 68),
    (v_carrera_id, 'Desarrollo Internacional de Negocios', 2, 68),
    (v_carrera_id, 'Obligaciones, Contratos y Sociedades', 2, 68),
    (v_carrera_id, 'Macroeconomía', 2, 68),
    (v_carrera_id, 'Estadística Empresarial II', 2, 68),
    (v_carrera_id, 'Diseño y Auditoría de Sistemas de Información', 2, 68),
    (v_carrera_id, 'Contabilidad Gerencial', 2, 68),

    -- Año 3
    (v_carrera_id, 'Cálculo Financiero', 3, 68),
    (v_carrera_id, 'Sistemas de Costos', 3, 68),
    (v_carrera_id, 'Programación Operativa', 3, 68),
    (v_carrera_id, 'Electivas (bloque, 2 materias) — 3er año 1C', 3, 136),
    (v_carrera_id, 'Impuestos', 3, 68),
    (v_carrera_id, 'Gerencia de Operaciones', 3, 68),
    (v_carrera_id, 'Liderazgo y Negociación', 3, 68),
    (v_carrera_id, 'Finanzas Corporativas I', 3, 68),
    (v_carrera_id, 'Electiva (bloque, 1 materia) — 3er año 2C', 3, 68),

    -- Año 4
    (v_carrera_id, 'Dirección Estratégica', 4, 68),
    (v_carrera_id, 'Control de Gestión', 4, 68),
    (v_carrera_id, 'Nuevas Tendencias en Administración', 4, 68),
    (v_carrera_id, 'Consultoría', 4, 68),
    (v_carrera_id, 'Electiva (bloque, 1 materia) — 4to año 1C', 4, 68),
    (v_carrera_id, 'Análisis Estratégico de Datos', 4, 68),
    (v_carrera_id, 'Desarrollo Empresarial', 4, 68),
    (v_carrera_id, 'Simulaciones y Toma de Decisiones en Negocios', 4, 68),
    (v_carrera_id, 'Electiva (bloque, 1 materia) — 4to año 2C', 4, 68);
end $$;


-- ============================================================
-- Carrera 2: UTDT — Licenciado/a en Administración de Empresas
-- Carga horaria pareja por tramo (no por materia puntual): 1er año 102 hs
-- c/u, 2do a 4to año 68 hs c/u. Los "campos menores" de 4to año son 10
-- especializaciones optativas posibles (Negocios Digitales, IA + Negocios,
-- Finanzas, Marketing, etc. — detalle completo en el doc de investigación),
-- no una lista fija: se cargan como bloque genérico por semestre, mismo
-- criterio que las electivas de UTN/UBA.
-- ============================================================
insert into carreras (universidad, nombre, nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora)
select 'UTDT', 'Licenciado/a en Administración de Empresas', 6, 8, true, 1
where not exists (
  select 1 from carreras where universidad = 'UTDT' and nombre = 'Licenciado/a en Administración de Empresas'
);

do $$
declare
  v_carrera_id uuid;
begin
  select id into v_carrera_id
  from carreras
  where universidad = 'UTDT' and nombre = 'Licenciado/a en Administración de Empresas';

  if v_carrera_id is null then
    raise notice 'No se encontró "Licenciado/a en Administración de Empresas" (UTDT): no se cargan materias.';
    return;
  end if;

  if exists (select 1 from materias_catalogo where carrera_id = v_carrera_id) then
    raise notice 'UTDT Administración de Empresas ya tiene materias cargadas: no se vuelve a cargar el catálogo.';
    return;
  end if;

  insert into materias_catalogo (carrera_id, nombre, anio_cursada, horas_catedra) values
    -- Año 1 (102 hs c/u)
    (v_carrera_id, 'Introducción al Derecho', 1, 102),
    (v_carrera_id, 'Administración I', 1, 102),
    (v_carrera_id, 'Economía I', 1, 102),
    (v_carrera_id, 'Matemática I', 1, 102),
    (v_carrera_id, 'Contabilidad Básica', 1, 102),
    (v_carrera_id, 'Economía II', 1, 102),
    (v_carrera_id, 'Matemática II', 1, 102),
    (v_carrera_id, 'Historia de Occidente a partir de la Modernidad', 1, 102),
    (v_carrera_id, 'Comprensión de Textos y Escritura', 1, 102),

    -- Año 2 (68 hs c/u)
    (v_carrera_id, 'Información y Contabilidad Gerencial I', 2, 68),
    (v_carrera_id, 'Administración II', 2, 68),
    (v_carrera_id, 'Microeconomía', 2, 68),
    (v_carrera_id, 'Introducción a la Estadística', 2, 68),
    (v_carrera_id, 'Información y Contabilidad Gerencial II', 2, 68),
    (v_carrera_id, 'Historia Económica Internacional', 2, 68),
    (v_carrera_id, 'Análisis Estadística', 2, 68),
    (v_carrera_id, 'Instituciones Políticas y de Gobierno', 2, 68),

    -- Año 3 (68 hs c/u)
    (v_carrera_id, 'Equipos, Personas y Liderazgo', 3, 68),
    (v_carrera_id, 'Dirección de Operaciones y Tecnología I', 3, 68),
    (v_carrera_id, 'Macroeconomía', 3, 68),
    (v_carrera_id, 'Métodos Analíticos Aplicados a los Negocios', 3, 68),
    (v_carrera_id, 'Aspectos Legales y Éticos de las Decisiones Empresariales', 3, 68),
    (v_carrera_id, 'Dirección Estratégica', 3, 68),
    (v_carrera_id, 'Riesgo, Incertidumbre y Finanzas', 3, 68),
    (v_carrera_id, 'Marketing', 3, 68),
    (v_carrera_id, 'Expresión Oral y Escrita', 3, 68),

    -- Año 4 (68 hs c/u)
    (v_carrera_id, 'Marketing Digital', 4, 68),
    (v_carrera_id, 'Negocios y Estrategia Digital', 4, 68),
    (v_carrera_id, 'Finanzas de la Empresa', 4, 68),
    (v_carrera_id, 'Electiva de Campo Menor (bloque, 1 materia) — 1er semestre', 4, 68),
    (v_carrera_id, 'Sustentabilidad y Empresa', 4, 68),
    (v_carrera_id, 'Desarrollo de Nuevos Negocios', 4, 68),
    (v_carrera_id, 'Electivas de Campo Menor (bloque, 2 materias) — 2do semestre', 4, 136);
end $$;


-- ============================================================
-- Carrera 3: UADE — Licenciatura en Negocios Digitales
-- Carrera distinta de la Licenciatura en Administración de Empresas de
-- arriba: comparten universidad y algún criterio, pero son títulos
-- separados con su propia fila en carreras y su propia malla. Sin "Trabajo
-- Integrador Final en Negocios Digitales" (tesina/capstone de cierre, no
-- una cursada con parciales) — este plan no tiene "Examen de Inglés" como
-- materia separada, a diferencia de la Carrera 1. Las optativas no tienen
-- nombres individuales publicados por la fuente: se cargan como bloques por
-- cuatrimestre, mismo criterio que las electivas de UTN/UBA.
-- ============================================================
insert into carreras (universidad, nombre, nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora)
select 'UADE', 'Licenciatura en Negocios Digitales', 6, 8, true, 1
where not exists (
  select 1 from carreras where universidad = 'UADE' and nombre = 'Licenciatura en Negocios Digitales'
);

do $$
declare
  v_carrera_id uuid;
begin
  select id into v_carrera_id
  from carreras
  where universidad = 'UADE' and nombre = 'Licenciatura en Negocios Digitales';

  if v_carrera_id is null then
    raise notice 'No se encontró "Licenciatura en Negocios Digitales" (UADE): no se cargan materias.';
    return;
  end if;

  if exists (select 1 from materias_catalogo where carrera_id = v_carrera_id) then
    raise notice 'UADE Negocios Digitales ya tiene materias cargadas: no se vuelve a cargar el catálogo.';
    return;
  end if;

  insert into materias_catalogo (carrera_id, nombre, anio_cursada, horas_catedra) values
    -- Año 1
    (v_carrera_id, 'Administración Empresarial I', 1, 68),
    (v_carrera_id, 'Marketing', 1, 68),
    (v_carrera_id, 'Taller de Diseño Digital', 1, 68),
    (v_carrera_id, 'Introducción al Derecho', 1, 68),
    (v_carrera_id, 'Matemática Empresarial I', 1, 68),
    (v_carrera_id, 'Administración Empresarial II', 1, 68),
    (v_carrera_id, 'Estadística Empresarial I', 1, 68),
    (v_carrera_id, 'Contabilidad I', 1, 68),
    (v_carrera_id, 'Plataformas y Negocios Web', 1, 68),
    (v_carrera_id, 'Taller de Programación I', 1, 68),

    -- Año 2
    (v_carrera_id, 'Gestión de las Personas en las Organizaciones', 2, 68),
    (v_carrera_id, 'Microeconomía', 2, 68),
    (v_carrera_id, 'Matemática Empresarial II', 2, 68),
    (v_carrera_id, 'Comunicación Multimedial', 2, 68),
    (v_carrera_id, 'Obligaciones y Contratos', 2, 68),
    (v_carrera_id, 'Contabilidad Gerencial', 2, 68),
    (v_carrera_id, 'Estadística Empresarial II', 2, 68),
    (v_carrera_id, 'Diseño y Desarrollo UX', 2, 68),
    (v_carrera_id, 'Inteligencia de Negocios y Analítica Digital', 2, 68),
    (v_carrera_id, 'Taller de Programación II', 2, 68),

    -- Año 3
    (v_carrera_id, 'Cálculo Financiero', 3, 68),
    (v_carrera_id, 'Gestión de Productos Digitales', 3, 68),
    (v_carrera_id, 'Estrategias de Precios', 3, 68),
    (v_carrera_id, 'Electivas (bloque, 2 materias) — 3er año 1C', 3, 136),
    (v_carrera_id, 'Impuestos', 3, 68),
    (v_carrera_id, 'Liderazgo y Negociación', 3, 68),
    (v_carrera_id, 'Logística Aplicada a Negocios Digitales', 3, 68),
    (v_carrera_id, 'Electivas (bloque, 2 materias) — 3er año 2C', 3, 136),

    -- Año 4
    (v_carrera_id, 'Finanzas Corporativas I', 4, 68),
    (v_carrera_id, 'Dirección Estratégica', 4, 68),
    (v_carrera_id, 'Ciencia de Datos para Negocios', 4, 68),
    (v_carrera_id, 'Consultoría', 4, 68),
    (v_carrera_id, 'Electiva (bloque, 1 materia) — 4to año 1C', 4, 68),
    (v_carrera_id, 'Desarrollo Empresarial', 4, 68),
    (v_carrera_id, 'Tópicos Avanzados en Negocios Digitales', 4, 68),
    (v_carrera_id, 'Electivas (bloque, 2 materias) — 4to año 2C', 4, 136);
end $$;
