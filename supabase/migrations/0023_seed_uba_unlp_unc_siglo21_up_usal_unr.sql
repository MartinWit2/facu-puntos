-- facu_puntos — carga el catálogo de ocho carreras nuevas: UBA (Ingeniería
-- en Informática y Contador Público), UNLP (Ingeniería Industrial), UNC
-- (Ingeniería Civil), Universidad Siglo 21 (Lic. en Administración),
-- Universidad de Palermo (Lic. en Psicología), USAL (Medicina) y UNR
-- (Ingeniería Mecánica).
-- Corré este script completo en el SQL Editor de Supabase. Es seguro
-- correrlo más de una vez: cada carrera se chequea por separado
-- (universidad + nombre) y no duplica ni la carrera ni sus materias si ya
-- están cargadas.
--
-- Reglas y puntos: defaults en las ocho (nota_aprobacion 6, nota_promocion
-- 8, permite_promocion true, puntos_por_hora 1, parciales/recup/final en
-- los defaults de la tabla 2/2/4).


-- ============================================================
-- Carrera 1: UBA — Ingeniería en Informática (FIUBA, Plan 2023)
-- Horas reales del plan oficial FIUBA. Las electivas de 5to año son dos
-- casilleros de 192 hs cada uno, cargados juntos como un solo bloque de
-- 384. Excluidas Trabajo Profesional y Tesis (alternativas entre sí para
-- la actividad final, se acreditan con informe/defensa, no con parciales).
-- ============================================================
insert into carreras (universidad, nombre, nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora)
select 'UBA', 'Ingeniería en Informática', 6, 8, true, 1
where not exists (
  select 1 from carreras where universidad = 'UBA' and nombre = 'Ingeniería en Informática'
);

do $$
declare
  v_carrera_id uuid;
begin
  select id into v_carrera_id from carreras where universidad = 'UBA' and nombre = 'Ingeniería en Informática';

  if v_carrera_id is null then
    raise notice 'No se encontró "Ingeniería en Informática" (UBA): no se cargan materias.';
    return;
  end if;

  if exists (select 1 from materias_catalogo where carrera_id = v_carrera_id) then
    raise notice 'UBA Ingeniería en Informática ya tiene materias cargadas: no se vuelve a cargar.';
    return;
  end if;

  insert into materias_catalogo (carrera_id, nombre, anio_cursada, horas_catedra) values
    -- Año 1
    (v_carrera_id, 'Introducción al Conocimiento de la Sociedad y el Estado', 1, 64),
    (v_carrera_id, 'Introducción al Pensamiento Científico', 1, 64),
    (v_carrera_id, 'Análisis Matemático A', 1, 144),
    (v_carrera_id, 'Álgebra A', 1, 144),
    (v_carrera_id, 'Física', 1, 96),
    (v_carrera_id, 'Pensamiento Computacional', 1, 96),

    -- Año 2
    (v_carrera_id, 'Análisis Matemático II', 2, 128),
    (v_carrera_id, 'Fundamentos de Programación', 2, 96),
    (v_carrera_id, 'Introducción al Desarrollo de Software', 2, 96),
    (v_carrera_id, 'Álgebra Lineal', 2, 128),
    (v_carrera_id, 'Organización del Computador', 2, 96),
    (v_carrera_id, 'Algoritmos y Estructuras de Datos', 2, 96),

    -- Año 3
    (v_carrera_id, 'Probabilidad y Estadística', 3, 96),
    (v_carrera_id, 'Teoría de Algoritmos', 3, 96),
    (v_carrera_id, 'Sistemas Operativos', 3, 96),
    (v_carrera_id, 'Paradigmas de Programación', 3, 96),
    (v_carrera_id, 'Base de Datos', 3, 96),
    (v_carrera_id, 'Modelación Numérica', 3, 64),
    (v_carrera_id, 'Taller de Programación', 3, 128),
    (v_carrera_id, 'Ingeniería de Software I', 3, 128),

    -- Año 4
    (v_carrera_id, 'Ciencia de Datos', 4, 96),
    (v_carrera_id, 'Gestión del Desarrollo de Sistemas Informáticos', 4, 96),
    (v_carrera_id, 'Programación Concurrente', 4, 96),
    (v_carrera_id, 'Redes', 4, 96),
    (v_carrera_id, 'Física para Informática', 4, 64),
    (v_carrera_id, 'Empresas de Base Tecnológica I', 4, 96),
    (v_carrera_id, 'Ingeniería de Software II', 4, 128),
    (v_carrera_id, 'Sistemas Distribuidos I', 4, 96),

    -- Año 5
    (v_carrera_id, 'Taller de Seguridad Informática', 5, 128),
    (v_carrera_id, 'Empresas de Base Tecnológica II', 5, 96),
    (v_carrera_id, 'Electivas (bloque) — 5to año', 5, 384);
end $$;


-- ============================================================
-- Carrera 2: UBA — Contador Público
-- Horas reales (cruzadas entre Código UBA y la web de la facultad, la suma
-- da exacto el total normativo de 2.808 hs). El año de cada materia es una
-- inferencia por cadena de correlativas (la fuente organiza por ciclo, no
-- por año) — menos firme que las horas. Los dos "Taller" del último grupo
-- tienen horas cátedra propias y correlativas como cualquier materia (no
-- son pasantía externa), se cargan normales.
-- ============================================================
insert into carreras (universidad, nombre, nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora)
select 'UBA', 'Contador Público', 6, 8, true, 1
where not exists (
  select 1 from carreras where universidad = 'UBA' and nombre = 'Contador Público'
);

do $$
declare
  v_carrera_id uuid;
begin
  select id into v_carrera_id from carreras where universidad = 'UBA' and nombre = 'Contador Público';

  if v_carrera_id is null then
    raise notice 'No se encontró "Contador Público" (UBA): no se cargan materias.';
    return;
  end if;

  if exists (select 1 from materias_catalogo where carrera_id = v_carrera_id) then
    raise notice 'UBA Contador Público ya tiene materias cargadas: no se vuelve a cargar.';
    return;
  end if;

  insert into materias_catalogo (carrera_id, nombre, anio_cursada, horas_catedra) values
    -- Año 1
    (v_carrera_id, 'Análisis Matemático I', 1, 108),
    (v_carrera_id, 'Economía', 1, 72),
    (v_carrera_id, 'Sociología', 1, 72),
    (v_carrera_id, 'Álgebra', 1, 72),
    (v_carrera_id, 'Historia Económica y Social General', 1, 72),
    (v_carrera_id, 'Metodología de las Ciencias Sociales', 1, 72),

    -- Año 2
    (v_carrera_id, 'Teoría Contable', 2, 108),
    (v_carrera_id, 'Estadística I', 2, 108),
    (v_carrera_id, 'Historia Económica y Social Argentina', 2, 72),
    (v_carrera_id, 'Microeconomía I', 2, 72),
    (v_carrera_id, 'Instituciones de Derecho Público', 2, 72),
    (v_carrera_id, 'Administración General', 2, 72),

    -- Año 3
    (v_carrera_id, 'Sistemas Administrativos', 3, 72),
    (v_carrera_id, 'Cálculo Financiero', 3, 72),
    (v_carrera_id, 'Sistemas Contables', 3, 108),
    (v_carrera_id, 'Sistemas de Costos', 3, 72),
    (v_carrera_id, 'Macroeconomía y Política Económica', 3, 108),
    (v_carrera_id, 'Derecho Económico', 3, 72),
    (v_carrera_id, 'Electiva u Optativa (bloque)', 3, 72),

    -- Año 4
    (v_carrera_id, 'Tecnología de la Información', 4, 108),
    (v_carrera_id, 'Administración Financiera', 4, 108),
    (v_carrera_id, 'Gestión y Costos para Contadores', 4, 108),
    (v_carrera_id, 'Instituciones de Derecho Privado', 4, 72),
    (v_carrera_id, 'Derecho del Trabajo y la Seguridad Social', 4, 72),
    (v_carrera_id, 'Contabilidad Financiera', 4, 108),

    -- Año 5
    (v_carrera_id, 'Teoría y Técnica Impositiva I', 5, 108),
    (v_carrera_id, 'Teoría y Técnica Impositiva II', 5, 108),
    (v_carrera_id, 'Contabilidad Gubernamental y Control de Gestión', 5, 72),
    (v_carrera_id, 'Derecho Crediticio, Bursátil e Insolvencia', 5, 72),
    (v_carrera_id, 'Contabilidad Social y Ambiental', 5, 36),
    (v_carrera_id, 'Auditoría', 5, 108),
    (v_carrera_id, 'Taller de Actuación Profesional Judicial', 5, 72),
    (v_carrera_id, 'Taller de Práctica Profesional en Organizaciones', 5, 108);
end $$;


-- ============================================================
-- Carrera 3: UNLP — Ingeniería Industrial (Facultad de Ingeniería, Plan 2018)
-- La fuente da horas SEMANALES por materia; se convirtieron a total con
-- horas_semanales × 16 (16 semanas, duración estándar de un cuatrimestre)
-- — estimación propia, no un total confirmado directamente por UNLP.
-- Excluidas: Práctica Profesional Supervisada, las 5 AFC (sin horas fijas),
-- Inglés (requisito de suficiencia) y la Nivelación de ingreso.
-- ============================================================
insert into carreras (universidad, nombre, nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora)
select 'UNLP', 'Ingeniería Industrial', 6, 8, true, 1
where not exists (
  select 1 from carreras where universidad = 'UNLP' and nombre = 'Ingeniería Industrial'
);

do $$
declare
  v_carrera_id uuid;
begin
  select id into v_carrera_id from carreras where universidad = 'UNLP' and nombre = 'Ingeniería Industrial';

  if v_carrera_id is null then
    raise notice 'No se encontró "Ingeniería Industrial" (UNLP): no se cargan materias.';
    return;
  end if;

  if exists (select 1 from materias_catalogo where carrera_id = v_carrera_id) then
    raise notice 'UNLP Ingeniería Industrial ya tiene materias cargadas: no se vuelve a cargar.';
    return;
  end if;

  insert into materias_catalogo (carrera_id, nombre, anio_cursada, horas_catedra) values
    -- Año 1
    (v_carrera_id, 'Introducción a la Ingeniería Industrial', 1, 48),
    (v_carrera_id, 'Matemática A', 1, 192),
    (v_carrera_id, 'Química para Ingeniería', 1, 96),
    (v_carrera_id, 'Física I', 1, 128),
    (v_carrera_id, 'Matemática B', 1, 192),
    (v_carrera_id, 'Electiva Humanística (bloque)', 1, 48),

    -- Año 2
    (v_carrera_id, 'Física II', 2, 128),
    (v_carrera_id, 'Matemática C', 2, 144),
    (v_carrera_id, 'Termodinámica y Recursos Energéticos', 2, 96),
    (v_carrera_id, 'Estructuras', 2, 96),
    (v_carrera_id, 'Materiales', 2, 80),
    (v_carrera_id, 'Introducción a la Programación y Análisis Numérico', 2, 80),
    (v_carrera_id, 'Representación Gráfica', 2, 96),

    -- Año 3
    (v_carrera_id, 'Electrotecnia y Electrónica', 3, 96),
    (v_carrera_id, 'Macroeconomía y Políticas Económicas y Sociales Argentinas', 3, 96),
    (v_carrera_id, 'Mecánica y Mecanismos', 3, 96),
    (v_carrera_id, 'Probabilidades y Estadística', 3, 96),
    (v_carrera_id, 'Microeconomía', 3, 96),
    (v_carrera_id, 'Producción I', 3, 96),
    (v_carrera_id, 'Procesos de Fabricación', 3, 80),
    (v_carrera_id, 'Mecánica de los Fluidos', 3, 96),

    -- Año 4
    (v_carrera_id, 'Administración General y Sistemas Administrativos', 4, 96),
    (v_carrera_id, 'Industrias', 4, 96),
    (v_carrera_id, 'Producción II', 4, 96),
    (v_carrera_id, 'Higiene y Seguridad en el Trabajo', 4, 48),
    (v_carrera_id, 'Administración Financiera', 4, 96),
    (v_carrera_id, 'Comercialización', 4, 96),
    (v_carrera_id, 'Máquinas e Instalaciones Eléctricas', 4, 96),
    (v_carrera_id, 'Fundamentos de la Ingeniería Ambiental', 4, 48),

    -- Año 5
    (v_carrera_id, 'Administración de Personal', 5, 96),
    (v_carrera_id, 'Dirección General', 5, 96),
    (v_carrera_id, 'Formulación y Evaluación de Proyectos', 5, 96),
    (v_carrera_id, 'Ingeniería Legal y Ejercicio Profesional', 5, 48),
    (v_carrera_id, 'Optativa 1 (bloque)', 5, 64),
    (v_carrera_id, 'Automatismos y Controles Industriales', 5, 96),
    (v_carrera_id, 'Producción III', 5, 96),
    (v_carrera_id, 'Instalaciones Industriales', 5, 80),
    (v_carrera_id, 'Optativa 2 (bloque)', 5, 64);
end $$;


-- ============================================================
-- Carrera 4: UNC — Ingeniería Civil (Fac. de Ciencias Exactas, Físicas y
-- Naturales, Plan 2025)
-- horas_catedra NULL en todas: la fuente solo da un total agregado de toda
-- la carrera, no desglose por materia. Excluida Práctica Supervisada (5to
-- año, práctica profesional). No se incluye el curso de ingreso
-- "Ambientación Universitaria" (nivelación, no es materia de la carrera).
-- ============================================================
insert into carreras (universidad, nombre, nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora)
select 'UNC', 'Ingeniería Civil', 6, 8, true, 1
where not exists (
  select 1 from carreras where universidad = 'UNC' and nombre = 'Ingeniería Civil'
);

do $$
declare
  v_carrera_id uuid;
begin
  select id into v_carrera_id from carreras where universidad = 'UNC' and nombre = 'Ingeniería Civil';

  if v_carrera_id is null then
    raise notice 'No se encontró "Ingeniería Civil" (UNC): no se cargan materias.';
    return;
  end if;

  if exists (select 1 from materias_catalogo where carrera_id = v_carrera_id) then
    raise notice 'UNC Ingeniería Civil ya tiene materias cargadas: no se vuelve a cargar.';
    return;
  end if;

  insert into materias_catalogo (carrera_id, nombre, anio_cursada, horas_catedra) values
    -- Año 1
    (v_carrera_id, 'Análisis Matemático 1', 1, null),
    (v_carrera_id, 'Química', 1, null),
    (v_carrera_id, 'Introducción a la Ingeniería', 1, null),
    (v_carrera_id, 'Economía', 1, null),
    (v_carrera_id, 'Álgebra Lineal', 1, null),
    (v_carrera_id, 'Física 1', 1, null),
    (v_carrera_id, 'Sistemas de Representación', 1, null),
    (v_carrera_id, 'Módulo de Inglés', 1, null),

    -- Año 2
    (v_carrera_id, 'Análisis Matemático 2', 2, null),
    (v_carrera_id, 'Probabilidad y Estadística', 2, null),
    (v_carrera_id, 'Estática', 2, null),
    (v_carrera_id, 'Topografía Básica', 2, null),
    (v_carrera_id, 'Física 2', 2, null),
    (v_carrera_id, 'Computación y Cálculo Numérico', 2, null),
    (v_carrera_id, 'Mecánica de las Estructuras', 2, null),
    (v_carrera_id, 'Topografía Aplicada', 2, null),

    -- Año 3
    (v_carrera_id, 'Ingeniería Geológica', 3, null),
    (v_carrera_id, 'Planificación del Transporte', 3, null),
    (v_carrera_id, 'Tecnología de Materiales', 3, null),
    (v_carrera_id, 'Mecánica de Fluidos', 3, null),
    (v_carrera_id, 'Tecnología de la Construcción', 3, null),
    (v_carrera_id, 'Análisis Estructural', 3, null),
    (v_carrera_id, 'Mecánica de Suelos', 3, null),
    (v_carrera_id, 'Instalaciones Sanitarias y Eléctricas', 3, null),

    -- Año 4
    (v_carrera_id, 'Hidrología', 4, null),
    (v_carrera_id, 'Instalaciones de Gas', 4, null),
    (v_carrera_id, 'Ingeniería Ambiental', 4, null),
    (v_carrera_id, 'Diseño Arquitectónico', 4, null),
    (v_carrera_id, 'Elasticidad', 4, null),
    (v_carrera_id, 'Infraestructura del Transporte', 4, null),
    (v_carrera_id, 'Hormigón Armado', 4, null),
    (v_carrera_id, 'Estructuras Metálicas', 4, null),
    (v_carrera_id, 'Ingeniería Legal', 4, null),

    -- Año 5
    (v_carrera_id, 'Construcción de Infraestructura', 5, null),
    (v_carrera_id, 'Ingeniería Sanitaria', 5, null),
    (v_carrera_id, 'Cimentaciones', 5, null),
    (v_carrera_id, 'Proyecto y Dirección de Obras', 5, null),
    (v_carrera_id, 'Diseño de Estructuras', 5, null),
    (v_carrera_id, 'Obras Hidráulicas', 5, null),
    (v_carrera_id, 'Higiene y Seguridad', 5, null),
    (v_carrera_id, 'Planeamiento y Urbanismo', 5, null);
end $$;


-- ============================================================
-- Carrera 5: Universidad Siglo 21 — Licenciatura en Administración
-- horas_catedra NULL en todas: el plan oficial no publica horas ni un
-- sistema de créditos. Excluidas Práctica Profesional de Administración y
-- Práctica Solidaria (pasantías, 4to año).
-- ============================================================
insert into carreras (universidad, nombre, nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora)
select 'Universidad Siglo 21', 'Licenciatura en Administración', 6, 8, true, 1
where not exists (
  select 1 from carreras where universidad = 'Universidad Siglo 21' and nombre = 'Licenciatura en Administración'
);

do $$
declare
  v_carrera_id uuid;
begin
  select id into v_carrera_id from carreras
  where universidad = 'Universidad Siglo 21' and nombre = 'Licenciatura en Administración';

  if v_carrera_id is null then
    raise notice 'No se encontró "Licenciatura en Administración" (Universidad Siglo 21): no se cargan materias.';
    return;
  end if;

  if exists (select 1 from materias_catalogo where carrera_id = v_carrera_id) then
    raise notice 'Universidad Siglo 21 Licenciatura en Administración ya tiene materias cargadas: no se vuelve a cargar.';
    return;
  end if;

  insert into materias_catalogo (carrera_id, nombre, anio_cursada, horas_catedra) values
    -- Año 1
    (v_carrera_id, 'Administración', 1, null),
    (v_carrera_id, 'Herramientas Matemáticas I (Álgebra)', 1, null),
    (v_carrera_id, 'Sistemas de Información Organizacionales', 1, null),
    (v_carrera_id, 'Psicología Social', 1, null),
    (v_carrera_id, 'Sociología General', 1, null),
    (v_carrera_id, 'Idioma Extranjero I', 1, null),
    (v_carrera_id, 'Producción I', 1, null),
    (v_carrera_id, 'Herramientas Matemáticas II (Análisis)', 1, null),
    (v_carrera_id, 'Contabilidad Básica y de Gestión', 1, null),
    (v_carrera_id, 'Idioma Extranjero II', 1, null),
    (v_carrera_id, 'Recursos Informáticos', 1, null),
    (v_carrera_id, 'Desarrollo Emprendedor', 1, null),

    -- Año 2
    (v_carrera_id, 'Economía I', 2, null),
    (v_carrera_id, 'Herramientas Matemáticas III (Estadística I)', 2, null),
    (v_carrera_id, 'Marketing I', 2, null),
    (v_carrera_id, 'Introducción al Comercio Exterior', 2, null),
    (v_carrera_id, 'Producción II', 2, null),
    (v_carrera_id, 'Idioma Extranjero III', 2, null),
    (v_carrera_id, 'Economía II', 2, null),
    (v_carrera_id, 'Análisis Cuantitativo Financiero', 2, null),
    (v_carrera_id, 'Herramientas Matemáticas IV (Investigación Operativa)', 2, null),
    (v_carrera_id, 'Estrategia', 2, null),
    (v_carrera_id, 'Cultura Organizacional', 2, null),
    (v_carrera_id, 'Idioma Extranjero IV', 2, null),

    -- Año 3
    (v_carrera_id, 'Herramientas Matemáticas V (Estadística II)', 3, null),
    (v_carrera_id, 'Contabilidad de Costos', 3, null),
    (v_carrera_id, 'Grupo y Liderazgo', 3, null),
    (v_carrera_id, 'Logística', 3, null),
    (v_carrera_id, 'Marco Legal de las Organizaciones', 3, null),
    (v_carrera_id, 'Idioma Extranjero V', 3, null),
    (v_carrera_id, 'Dirección General', 3, null),
    (v_carrera_id, 'Seminario de Planificación y Control de Gestión', 3, null),
    (v_carrera_id, 'Administración de Recursos Humanos', 3, null),
    (v_carrera_id, 'Formulación y Evaluación de Proyectos', 3, null),
    (v_carrera_id, 'Principios de Derecho Laboral', 3, null),
    (v_carrera_id, 'Idioma Extranjero VI', 3, null),

    -- Año 4
    (v_carrera_id, 'Emprendimientos Universitarios', 4, null),
    (v_carrera_id, 'Administración Financiera', 4, null),
    (v_carrera_id, 'Régimen Tributario', 4, null),
    (v_carrera_id, 'Gestión Ambiental', 4, null),
    (v_carrera_id, 'Actualización Profesional', 4, null),
    (v_carrera_id, 'Instituciones Políticas y Gubernamentales', 4, null),
    (v_carrera_id, 'Economía Argentina', 4, null),
    (v_carrera_id, 'Herramientas Matemáticas VI (Modelos de Simulación)', 4, null),
    (v_carrera_id, 'Seminario Final de Administración', 4, null);
end $$;


-- ============================================================
-- Carrera 6: Universidad de Palermo — Licenciatura en Psicología
-- horas_catedra NULL en todas: no publicadas en la fuente. Excluidas
-- Práctica Profesional 1 y 2 (Instituciones, pasantía de cierre) y la
-- Residencia final con su taller (requisito de titulación). "Prácticas con
-- Diferentes Enfoques en Psicoterapia" y "Prácticas en Neuropsicología
-- Infanto Juvenil" SÍ se cargan (son materias regulares del plan).
-- ============================================================
insert into carreras (universidad, nombre, nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora)
select 'Universidad de Palermo', 'Licenciatura en Psicología', 6, 8, true, 1
where not exists (
  select 1 from carreras where universidad = 'Universidad de Palermo' and nombre = 'Licenciatura en Psicología'
);

do $$
declare
  v_carrera_id uuid;
begin
  select id into v_carrera_id from carreras
  where universidad = 'Universidad de Palermo' and nombre = 'Licenciatura en Psicología';

  if v_carrera_id is null then
    raise notice 'No se encontró "Licenciatura en Psicología" (Universidad de Palermo): no se cargan materias.';
    return;
  end if;

  if exists (select 1 from materias_catalogo where carrera_id = v_carrera_id) then
    raise notice 'Universidad de Palermo Licenciatura en Psicología ya tiene materias cargadas: no se vuelve a cargar.';
    return;
  end if;

  insert into materias_catalogo (carrera_id, nombre, anio_cursada, horas_catedra) values
    -- Año 1
    (v_carrera_id, 'Psicología', 1, null),
    (v_carrera_id, 'Neurociencia (Psicobiología)', 1, null),
    (v_carrera_id, 'Psicología del Aprendizaje', 1, null),
    (v_carrera_id, 'Antropología', 1, null),
    (v_carrera_id, 'Historia de la Psicología', 1, null),
    (v_carrera_id, 'Modelos y Teorías 1 (Psicoanálisis)', 1, null),
    (v_carrera_id, 'Cognición, Pensamiento y Lenguaje', 1, null),
    (v_carrera_id, 'Sensación y Percepción', 1, null),
    (v_carrera_id, 'Filosofía de la Ciencia', 1, null),
    (v_carrera_id, 'Sociología', 1, null),

    -- Año 2
    (v_carrera_id, 'Modelos y Teorías 2 (Psic. Genética y Cognitiva)', 2, null),
    (v_carrera_id, 'Modelos y Teorías 3 (Psic. Sistémica y Conductismo)', 2, null),
    (v_carrera_id, 'Psicología Evolutiva 1 (Niños y adolescentes)', 2, null),
    (v_carrera_id, 'Estadística Aplicada a la Psicología', 2, null),
    (v_carrera_id, 'Psicología Social', 2, null),
    (v_carrera_id, 'Cultura y Sociedad 1', 2, null),
    (v_carrera_id, 'Modelos y Teorías 4 (Escuela Inglesa y Francesa)', 2, null),
    (v_carrera_id, 'Modelos y Teorías 5', 2, null),
    (v_carrera_id, 'Psicología Evolutiva 2 (Adultos y 3ra edad)', 2, null),
    (v_carrera_id, 'Métodos de Investigación en Psicología', 2, null),
    (v_carrera_id, 'Interacción Social y Dinámica de Grupos', 2, null),
    (v_carrera_id, 'Cultura y Sociedad 2', 2, null),

    -- Año 3
    (v_carrera_id, 'Psicopatología 1', 3, null),
    (v_carrera_id, 'Psicología de la Personalidad', 3, null),
    (v_carrera_id, 'Exploración y Evaluación Psicológica 1', 3, null),
    (v_carrera_id, 'Filosofía', 3, null),
    (v_carrera_id, 'Salud Pública y Psicología Comunitaria', 3, null),
    (v_carrera_id, 'Práctica de Investigación', 3, null),
    (v_carrera_id, 'Psicopatología 2', 3, null),
    (v_carrera_id, 'Psicología de la Educación', 3, null),
    (v_carrera_id, 'Exploración y Evaluación Psicológica 2 y Rorschach', 3, null),
    (v_carrera_id, 'Psicología de la Motivación y la Emoción', 3, null),
    (v_carrera_id, 'Psicología del Trabajo y las Organizaciones', 3, null),
    (v_carrera_id, 'Prácticas con Diferentes Enfoques en Psicoterapia', 3, null),

    -- Año 4
    (v_carrera_id, 'Psicología Clínica y Psicoterapia 1', 4, null),
    (v_carrera_id, 'Neurobiología de los Trastornos Mentales', 4, null),
    (v_carrera_id, 'Clínica y Psicofarmacología', 4, null),
    (v_carrera_id, 'Prácticas en Neuropsicología Infanto Juvenil', 4, null),
    (v_carrera_id, 'Formación Profesional 1 (bloque electivo)', 4, null),
    (v_carrera_id, 'Psicología Clínica y Psicoterapia 2', 4, null),
    (v_carrera_id, 'Psicología y Ética Profesional', 4, null),
    (v_carrera_id, 'Orientación Vocacional y Ocupacional', 4, null),
    (v_carrera_id, 'Psicología Forense', 4, null),
    (v_carrera_id, 'Formación Profesional 2 (bloque electivo)', 4, null);
end $$;


-- ============================================================
-- Carrera 7: USAL (Universidad del Salvador) — Medicina (Plan 14)
-- Horas reales ("Hs. Totales" del plan oficial). Excluido el 6to año
-- completo (Internado Rotatorio, 1687 hs — práctica clínica full-time, no
-- cursada de materias con parciales). "Medicina I/II/III" incluyen
-- sub-rotaciones internas sin horas propias desglosadas — se cargan como
-- una sola materia grande por el total dado.
-- ============================================================
insert into carreras (universidad, nombre, nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora)
select 'USAL', 'Medicina', 6, 8, true, 1
where not exists (
  select 1 from carreras where universidad = 'USAL' and nombre = 'Medicina'
);

do $$
declare
  v_carrera_id uuid;
begin
  select id into v_carrera_id from carreras where universidad = 'USAL' and nombre = 'Medicina';

  if v_carrera_id is null then
    raise notice 'No se encontró "Medicina" (USAL): no se cargan materias.';
    return;
  end if;

  if exists (select 1 from materias_catalogo where carrera_id = v_carrera_id) then
    raise notice 'USAL Medicina ya tiene materias cargadas: no se vuelve a cargar.';
    return;
  end if;

  insert into materias_catalogo (carrera_id, nombre, anio_cursada, horas_catedra) values
    -- Año 1
    (v_carrera_id, 'Anatomía Normal, de Superficie y por Imágenes', 1, 256),
    (v_carrera_id, 'Embriología Humana', 1, 32),
    (v_carrera_id, 'Histología y Biología Celular', 1, 192),
    (v_carrera_id, 'Bioquímica Médica', 1, 160),
    (v_carrera_id, 'Introducción a la Salud Pública', 1, 32),
    (v_carrera_id, 'Seguridad del Paciente I', 1, 32),
    (v_carrera_id, 'Primeros Auxilios', 1, 16),

    -- Año 2
    (v_carrera_id, 'Fisiología y Biofísica', 2, 256),
    (v_carrera_id, 'Inmunología', 2, 80),
    (v_carrera_id, 'Biología Molecular', 2, 32),
    (v_carrera_id, 'Microbiología: Bacterias y Hongos', 2, 112),
    (v_carrera_id, 'Microbiología: Virus y Parásitos', 2, 112),
    (v_carrera_id, 'Patología I', 2, 80),
    (v_carrera_id, 'Psicología I', 2, 32),
    (v_carrera_id, 'Sociología de la Salud', 2, 32),
    (v_carrera_id, 'Metodología de la Investigación I', 2, 32),
    (v_carrera_id, 'Seguridad del Paciente II', 2, 32),

    -- Año 3
    (v_carrera_id, 'Patología II', 3, 128),
    (v_carrera_id, 'Farmacología I', 3, 128),
    (v_carrera_id, 'Medicina I', 3, 544),
    (v_carrera_id, 'Demografía', 3, 32),
    (v_carrera_id, 'Psicología II', 3, 32),
    (v_carrera_id, 'Metodología de la Investigación II', 3, 32),
    (v_carrera_id, 'Antropología Filosófica', 3, 54),
    (v_carrera_id, 'Seguridad del Paciente III', 3, 32),
    (v_carrera_id, 'Electiva (bloque, 1 materia) — 3er año', 3, 32),

    -- Año 4
    (v_carrera_id, 'Medicina II', 4, 412),
    (v_carrera_id, 'Diagnóstico por Imágenes', 4, 32),
    (v_carrera_id, 'Genética Humana', 4, 32),
    (v_carrera_id, 'Dermatología', 4, 60),
    (v_carrera_id, 'Cirugía General', 4, 160),
    (v_carrera_id, 'Neurocirugía', 4, 41),
    (v_carrera_id, 'Anestesiología', 4, 32),
    (v_carrera_id, 'Urología', 4, 56),
    (v_carrera_id, 'Oftalmología', 4, 40),
    (v_carrera_id, 'Psiquiatría', 4, 50),
    (v_carrera_id, 'Epidemiología', 4, 32),
    (v_carrera_id, 'Antropología Teológica', 4, 54),
    (v_carrera_id, 'Inglés Técnico', 4, 32),
    (v_carrera_id, 'Seguridad del Paciente IV', 4, 32),
    (v_carrera_id, 'Electivas (bloque, 2 materias) — 4to año', 4, 64),

    -- Año 5
    (v_carrera_id, 'Medicina III', 5, 308),
    (v_carrera_id, 'Farmacología II', 5, 64),
    (v_carrera_id, 'Enfermedades Infecciosas', 5, 136),
    (v_carrera_id, 'Medicina Legal', 5, 60),
    (v_carrera_id, 'Toxicología', 5, 32),
    (v_carrera_id, 'Otorrinolaringología', 5, 60),
    (v_carrera_id, 'Ortopedia y Traumatología', 5, 60),
    (v_carrera_id, 'Pediatría', 5, 160),
    (v_carrera_id, 'Ginecología', 5, 80),
    (v_carrera_id, 'Obstetricia', 5, 80),
    (v_carrera_id, 'Políticas Estratégicas de Salud', 5, 32),
    (v_carrera_id, 'Ética Biomédica', 5, 64),
    (v_carrera_id, 'Metodología de la Investigación III', 5, 48),
    (v_carrera_id, 'Seguridad del Paciente V', 5, 32),
    (v_carrera_id, 'Electivas (bloque, 2 materias) — 5to año', 5, 64);
end $$;


-- ============================================================
-- Carrera 8: UNR — Ingeniería Mecánica (FCEIA, Plan Res. 314/99)
-- Horas reales (ya vienen como total en la fuente). Excluida "Electiva I"
-- del 9no semestre (ligada a la P.P.S., se excluye igual que cualquier
-- PPS) y la Prueba de suficiencia de Inglés (requisito de idioma, sin
-- cátedra propia).
-- ============================================================
insert into carreras (universidad, nombre, nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora)
select 'UNR', 'Ingeniería Mecánica', 6, 8, true, 1
where not exists (
  select 1 from carreras where universidad = 'UNR' and nombre = 'Ingeniería Mecánica'
);

do $$
declare
  v_carrera_id uuid;
begin
  select id into v_carrera_id from carreras where universidad = 'UNR' and nombre = 'Ingeniería Mecánica';

  if v_carrera_id is null then
    raise notice 'No se encontró "Ingeniería Mecánica" (UNR): no se cargan materias.';
    return;
  end if;

  if exists (select 1 from materias_catalogo where carrera_id = v_carrera_id) then
    raise notice 'UNR Ingeniería Mecánica ya tiene materias cargadas: no se vuelve a cargar.';
    return;
  end if;

  insert into materias_catalogo (carrera_id, nombre, anio_cursada, horas_catedra) values
    -- Año 1
    (v_carrera_id, 'Análisis Matemático I', 1, 128),
    (v_carrera_id, 'Álgebra y Geometría I', 1, 96),
    (v_carrera_id, 'Sistemas de Representación', 1, 96),
    (v_carrera_id, 'Ingeniería Mecánica (introductoria)', 1, 32),
    (v_carrera_id, 'Análisis Matemático II', 1, 112),
    (v_carrera_id, 'Álgebra y Geometría II', 1, 80),
    (v_carrera_id, 'Física I', 1, 112),
    (v_carrera_id, 'Informática I', 1, 80),

    -- Año 2
    (v_carrera_id, 'Análisis Matemático III', 2, 96),
    (v_carrera_id, 'Física II', 2, 112),
    (v_carrera_id, 'Química', 2, 64),
    (v_carrera_id, 'Mecánica del Sólido', 2, 112),
    (v_carrera_id, 'Física III', 2, 96),
    (v_carrera_id, 'Cinemática y Dinámica', 2, 96),
    (v_carrera_id, 'Termodinámica I', 2, 96),
    (v_carrera_id, 'Informática Aplicada', 2, 128),

    -- Año 3
    (v_carrera_id, 'Elementos de Máquinas', 3, 128),
    (v_carrera_id, 'Termodinámica II', 3, 64),
    (v_carrera_id, 'Ciencia de los Materiales', 3, 96),
    (v_carrera_id, 'Mecánica Aplicada', 3, 112),
    (v_carrera_id, 'Diseño Industrial', 3, 112),
    (v_carrera_id, 'Mecánica de los Fluidos', 3, 112),
    (v_carrera_id, 'Tecnología de los Materiales', 3, 96),
    (v_carrera_id, 'Electrotecnología - Máquinas Eléctricas', 3, 80),

    -- Año 4
    (v_carrera_id, 'Introducción a los Sistemas Lógicos y Comandos Automáticos', 4, 128),
    (v_carrera_id, 'Máquinas Térmicas I', 4, 112),
    (v_carrera_id, 'Transformación de Materiales', 4, 96),
    (v_carrera_id, 'Higiene y Seguridad Industrial', 4, 64),
    (v_carrera_id, 'Máquinas Herramientas y Tecnología de la Fabricación', 4, 128),
    (v_carrera_id, 'Economía y Legislación', 4, 80),
    (v_carrera_id, 'Comportamiento Mecánico de los Materiales', 4, 80),
    (v_carrera_id, 'Instalaciones Eléctricas e Instrumentación', 4, 112),

    -- Año 5
    (v_carrera_id, 'Máquinas Térmicas II', 5, 112),
    (v_carrera_id, 'Organización y Control de la Producción', 5, 112),
    (v_carrera_id, 'Proyecto de Ingeniería Mecánica', 5, 96),
    (v_carrera_id, 'Máquinas de Transporte y Agrícolas', 5, 128),
    (v_carrera_id, 'Ensayos Especiales', 5, 96),
    (v_carrera_id, 'Metrología y Calidad', 5, 80),
    (v_carrera_id, 'Electiva II (bloque)', 5, 80);
end $$;
