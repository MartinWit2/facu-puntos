-- facu_puntos — Fase 2: agrega la columna `universidad` a carreras y carga
-- el catálogo de UTN Ingeniería en Sistemas de Información.
-- Corré este script completo en el SQL Editor de Supabase.
-- Es seguro correrlo más de una vez: no duplica la carrera ni las materias
-- si ya están cargadas.

-- 1) Columna universidad, para distinguir carreras con el mismo nombre en
-- universidades distintas (ej. "Administración de Empresas").
alter table carreras add column if not exists universidad text;

-- 2) Carrera: solo se inserta si todavía no existe una fila con ese nombre.
insert into carreras (universidad, nombre, nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora)
select 'UTN', 'Ingeniería en Sistemas de Información', 6, 8, true, 1
where not exists (
  select 1 from carreras where nombre = 'Ingeniería en Sistemas de Información'
);

-- 3) Catálogo de materias: solo se carga si esa carrera todavía no tiene
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
  where nombre = 'Ingeniería en Sistemas de Información';

  if v_carrera_id is null then
    raise notice 'No se encontró la carrera "Ingeniería en Sistemas de Información": no se cargan materias.';
    return;
  end if;

  if exists (select 1 from materias_catalogo where carrera_id = v_carrera_id) then
    raise notice 'Esa carrera ya tiene materias cargadas: no se vuelve a cargar el catálogo.';
    return;
  end if;

  insert into materias_catalogo (carrera_id, nombre, anio_cursada, horas_catedra) values
    -- 1er Nivel
    (v_carrera_id, 'Análisis Matemático I', 1, 160),
    (v_carrera_id, 'Álgebra y Geometría Analítica', 1, 160),
    (v_carrera_id, 'Física I', 1, 160),
    (v_carrera_id, 'Inglés I', 1, 64),
    (v_carrera_id, 'Lógica y Estructuras Discretas', 1, 96),
    (v_carrera_id, 'Algoritmos y Estructuras de Datos', 1, 160),
    (v_carrera_id, 'Arquitectura de Computadoras', 1, 128),
    (v_carrera_id, 'Sistemas y Procesos de Negocio', 1, 96),

    -- 2do Nivel
    (v_carrera_id, 'Análisis Matemático II', 2, 160),
    (v_carrera_id, 'Física II', 2, 160),
    (v_carrera_id, 'Ingeniería y Sociedad', 2, 64),
    (v_carrera_id, 'Inglés II', 2, 64),
    (v_carrera_id, 'Sintaxis y Semántica de los Lenguajes', 2, 128),
    (v_carrera_id, 'Paradigmas de Programación', 2, 128),
    (v_carrera_id, 'Sistemas Operativos', 2, 128),
    (v_carrera_id, 'Análisis de Sistemas de Información', 2, 192),

    -- 3er Nivel
    (v_carrera_id, 'Probabilidad y Estadística', 3, 96),
    (v_carrera_id, 'Economía', 3, 96),
    (v_carrera_id, 'Bases de Datos', 3, 128),
    (v_carrera_id, 'Desarrollo de Software', 3, 128),
    (v_carrera_id, 'Comunicación de Datos', 3, 128),
    (v_carrera_id, 'Análisis Numérico', 3, 96),
    (v_carrera_id, 'Diseño de Sistemas de Información', 3, 192),
    (v_carrera_id, 'Electivas (bloque) — 3er Nivel', 3, 128),

    -- 4to Nivel
    (v_carrera_id, 'Legislación', 4, 64),
    (v_carrera_id, 'Ingeniería y Calidad de Software', 4, 96),
    (v_carrera_id, 'Redes de Datos', 4, 128),
    (v_carrera_id, 'Investigación Operativa', 4, 128),
    (v_carrera_id, 'Simulación', 4, 96),
    (v_carrera_id, 'Tecnologías para la Automatización', 4, 96),
    (v_carrera_id, 'Administración de Sistemas de Información', 4, 192),
    (v_carrera_id, 'Electivas (bloque) — 4to Nivel', 4, 192),

    -- 5to Nivel
    (v_carrera_id, 'Inteligencia Artificial', 5, 96),
    (v_carrera_id, 'Ciencia de Datos', 5, 96),
    (v_carrera_id, 'Sistemas de Gestión', 5, 128),
    (v_carrera_id, 'Gestión Gerencial', 5, 96),
    (v_carrera_id, 'Seguridad en los Sistemas de Información', 5, 96),
    (v_carrera_id, 'Proyecto Final', 5, 192),
    (v_carrera_id, 'Electivas (bloque) — 5to Nivel', 5, 320);
end $$;
