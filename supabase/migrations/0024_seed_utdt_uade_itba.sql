-- facu_puntos — carga el catálogo de cuatro carreras nuevas: UTDT (Lic. en
-- Economía), UADE (Ingeniería en Informática y Abogacía, ambas de
-- facultades distintas a las de Ciencias Económicas ya cargadas) e ITBA
-- (Ingeniería Industrial).
-- Corré este script completo en el SQL Editor de Supabase. Es seguro
-- correrlo más de una vez: cada carrera se chequea por separado
-- (universidad + nombre) y no duplica ni la carrera ni sus materias si ya
-- están cargadas.
--
-- Reglas y puntos: defaults en las cuatro (nota_aprobacion 6, nota_promocion
-- 8, permite_promocion true, puntos_por_hora 1, parciales/recup/final en
-- los defaults de la tabla 2/2/4).


-- ============================================================
-- Carrera 1: UTDT — Licenciatura en Economía
-- Misma regla institucional de horas que UTDT Administración: 102 hs/materia
-- en 1er año, 68 hs/materia del 2do en adelante. Excluido Seminario de
-- Graduación (tesina). Los 3 "Curso de Campo Menor" son cada uno un
-- casillero electivo distinto — se cargan como 3 filas individuales, no un
-- bloque combinado.
-- ============================================================
insert into carreras (universidad, nombre, nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora)
select 'UTDT', 'Licenciatura en Economía', 6, 8, true, 1
where not exists (
  select 1 from carreras where universidad = 'UTDT' and nombre = 'Licenciatura en Economía'
);

do $$
declare
  v_carrera_id uuid;
begin
  select id into v_carrera_id from carreras where universidad = 'UTDT' and nombre = 'Licenciatura en Economía';

  if v_carrera_id is null then
    raise notice 'No se encontró "Licenciatura en Economía" (UTDT): no se cargan materias.';
    return;
  end if;

  if exists (select 1 from materias_catalogo where carrera_id = v_carrera_id) then
    raise notice 'UTDT Licenciatura en Economía ya tiene materias cargadas: no se vuelve a cargar.';
    return;
  end if;

  insert into materias_catalogo (carrera_id, nombre, anio_cursada, horas_catedra) values
    -- Año 1 (102 hs c/u)
    (v_carrera_id, 'Matemática I', 1, 102),
    (v_carrera_id, 'Economía I', 1, 102),
    (v_carrera_id, 'Contabilidad Básica', 1, 102),
    (v_carrera_id, 'Instituciones Políticas y de Gobierno', 1, 102),
    (v_carrera_id, 'Comprensión de Textos y Escritura', 1, 102),
    (v_carrera_id, 'Matemática II', 1, 102),
    (v_carrera_id, 'Economía II', 1, 102),
    (v_carrera_id, 'Historia de Occidente a partir de la Modernidad', 1, 102),
    (v_carrera_id, 'Problemas Filosóficos', 1, 102),

    -- Año 2 (68 hs c/u)
    (v_carrera_id, 'Introducción a la Estadística', 2, 68),
    (v_carrera_id, 'Introducción al Derecho', 2, 68),
    (v_carrera_id, 'Microeconomía', 2, 68),
    (v_carrera_id, 'Economía Matemática', 2, 68),
    (v_carrera_id, 'Análisis Estadístico', 2, 68),
    (v_carrera_id, 'Historia Económica Internacional', 2, 68),
    (v_carrera_id, 'Macroeconomía', 2, 68),
    (v_carrera_id, 'Tópicos de Microeconomía', 2, 68),

    -- Año 3 (68 hs c/u)
    (v_carrera_id, 'Comercio Internacional', 3, 68),
    (v_carrera_id, 'Historia del Pensamiento Económico', 3, 68),
    (v_carrera_id, 'Econometría', 3, 68),
    (v_carrera_id, 'Economía Matemática II', 3, 68),
    (v_carrera_id, 'Expresión Oral y Escrita', 3, 68),
    (v_carrera_id, 'Riesgo, Incertidumbre y Finanzas', 3, 68),
    (v_carrera_id, 'Organización Industrial', 3, 68),
    (v_carrera_id, 'Tópicos de Macroeconomía', 3, 68),
    (v_carrera_id, 'Curso de Campo Menor 1 (electivo)', 3, 68),

    -- Año 4 (68 hs c/u)
    (v_carrera_id, 'Desarrollo Económico', 4, 68),
    (v_carrera_id, 'Finanzas Públicas', 4, 68),
    (v_carrera_id, 'Moneda y Bancos', 4, 68),
    (v_carrera_id, 'Curso de Campo Menor 2 (electivo)', 4, 68),
    (v_carrera_id, 'Economía Monetaria Internacional', 4, 68),
    (v_carrera_id, 'Historia Económica Argentina', 4, 68),
    (v_carrera_id, 'Tópicos de Economía Aplicada', 4, 68),
    (v_carrera_id, 'Curso de Campo Menor 3 (electivo)', 4, 68);
end $$;


-- ============================================================
-- Carrera 2: UADE — Ingeniería en Informática (Facultad de Ingeniería y
-- Ciencias Exactas — distinta de la Facultad de Ciencias Económicas de las
-- otras carreras de UADE ya cargadas)
-- horas_catedra NULL en todas: el patrón de 68 hs de Ciencias Económicas es
-- de esa facultad puntual, no se confirmó que esta otra facultad lo
-- comparta — mejor no asumirlo. Excluidas Examen de Inglés, Práctica
-- Profesional Supervisada y Proyecto Final (examen de idioma/práctica/tesis
-- sin parciales tradicionales).
-- ============================================================
insert into carreras (universidad, nombre, nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora)
select 'UADE', 'Ingeniería en Informática', 6, 8, true, 1
where not exists (
  select 1 from carreras where universidad = 'UADE' and nombre = 'Ingeniería en Informática'
);

do $$
declare
  v_carrera_id uuid;
begin
  select id into v_carrera_id from carreras where universidad = 'UADE' and nombre = 'Ingeniería en Informática';

  if v_carrera_id is null then
    raise notice 'No se encontró "Ingeniería en Informática" (UADE): no se cargan materias.';
    return;
  end if;

  if exists (select 1 from materias_catalogo where carrera_id = v_carrera_id) then
    raise notice 'UADE Ingeniería en Informática ya tiene materias cargadas: no se vuelve a cargar.';
    return;
  end if;

  insert into materias_catalogo (carrera_id, nombre, anio_cursada, horas_catedra) values
    -- Año 1
    (v_carrera_id, 'Fundamentos de Informática', 1, null),
    (v_carrera_id, 'Sistemas de Información I', 1, null),
    (v_carrera_id, 'Pensamiento Crítico y Comunicación', 1, null),
    (v_carrera_id, 'Teoría de Sistemas', 1, null),
    (v_carrera_id, 'Elementos de Álgebra y Geometría', 1, null),
    (v_carrera_id, 'Programación I', 1, null),
    (v_carrera_id, 'Sistemas de Representación', 1, null),
    (v_carrera_id, 'Fundamentos de Química', 1, null),
    (v_carrera_id, 'Arquitectura de Computadores', 1, null),
    (v_carrera_id, 'Matemática Discreta', 1, null),
    (v_carrera_id, 'Álgebra', 1, null),

    -- Año 2
    (v_carrera_id, 'Programación II', 2, null),
    (v_carrera_id, 'Sistemas de Información II', 2, null),
    (v_carrera_id, 'Sistemas Operativos', 2, null),
    (v_carrera_id, 'Física I', 2, null),
    (v_carrera_id, 'Cálculo I', 2, null),
    (v_carrera_id, 'Programación III', 2, null),
    (v_carrera_id, 'Paradigma Orientado a Objetos', 2, null),
    (v_carrera_id, 'Fundamentos de Telecomunicaciones', 2, null),
    (v_carrera_id, 'Ingeniería de Datos I', 2, null),
    (v_carrera_id, 'Cálculo II', 2, null),

    -- Año 3
    (v_carrera_id, 'Proceso de Desarrollo de Software', 3, null),
    (v_carrera_id, 'Seminario de Integración Profesional', 3, null),
    (v_carrera_id, 'Teleinformática y Redes', 3, null),
    (v_carrera_id, 'Ingeniería de Datos II', 3, null),
    (v_carrera_id, 'Probabilidad y Estadística', 3, null),
    (v_carrera_id, 'Aplicaciones Interactivas', 3, null),
    (v_carrera_id, 'Ingeniería de Software', 3, null),
    (v_carrera_id, 'Física II', 3, null),
    (v_carrera_id, 'Teoría de la Computación', 3, null),
    (v_carrera_id, 'Estadística Avanzada', 3, null),

    -- Año 4
    (v_carrera_id, 'Desarrollo de Aplicaciones I', 4, null),
    (v_carrera_id, 'Dirección de Proyectos Informáticos', 4, null),
    (v_carrera_id, 'Ciencia de Datos', 4, null),
    (v_carrera_id, 'Seguridad e Integridad de la Información', 4, null),
    (v_carrera_id, 'Modelado y Simulación', 4, null),
    (v_carrera_id, 'Desarrollo de Aplicaciones II', 4, null),
    (v_carrera_id, 'Evaluación de Proyectos Informáticos', 4, null),
    (v_carrera_id, 'Inteligencia Artificial', 4, null),
    (v_carrera_id, 'Tecnología y Medio Ambiente', 4, null),
    (v_carrera_id, 'Electiva (bloque, 1 materia) — 4to año', 4, null),

    -- Año 5
    (v_carrera_id, 'Arquitectura de Aplicaciones', 5, null),
    (v_carrera_id, 'Tendencias Tecnológicas', 5, null),
    (v_carrera_id, 'Calidad de Software', 5, null),
    (v_carrera_id, 'Electiva (bloque, 1 materia) — 5to año 1C', 5, null),
    (v_carrera_id, 'Negocios Tecnológicos', 5, null),
    (v_carrera_id, 'Tecnología e Innovación', 5, null),
    (v_carrera_id, 'Derecho Informático', 5, null),
    (v_carrera_id, 'Electiva (bloque, 1 materia) — 5to año 2C', 5, null);
end $$;


-- ============================================================
-- Carrera 3: UADE — Abogacía (Facultad de Ciencias Jurídicas y Sociales)
-- horas_catedra NULL en todas (misma razón que Ingeniería en Informática de
-- arriba: facultad distinta a la de Ciencias Económicas, no se confirmó que
-- comparta el patrón de 68 hs). Lista plana, sin orientaciones (a
-- diferencia de Abogacía de UBA). Excluido Trabajo de Integración Final
-- (tesina). "Práctica y Ética Profesional" es materia curricular regular,
-- se carga normal.
-- ============================================================
insert into carreras (universidad, nombre, nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora)
select 'UADE', 'Abogacía', 6, 8, true, 1
where not exists (
  select 1 from carreras where universidad = 'UADE' and nombre = 'Abogacía'
);

do $$
declare
  v_carrera_id uuid;
begin
  select id into v_carrera_id from carreras where universidad = 'UADE' and nombre = 'Abogacía';

  if v_carrera_id is null then
    raise notice 'No se encontró "Abogacía" (UADE): no se cargan materias.';
    return;
  end if;

  if exists (select 1 from materias_catalogo where carrera_id = v_carrera_id) then
    raise notice 'UADE Abogacía ya tiene materias cargadas: no se vuelve a cargar.';
    return;
  end if;

  insert into materias_catalogo (carrera_id, nombre, anio_cursada, horas_catedra) values
    -- Año 1
    (v_carrera_id, 'Historia del Derecho', 1, null),
    (v_carrera_id, 'Instituciones de Derecho Privado I', 1, null),
    (v_carrera_id, 'Teoría General del Derecho', 1, null),
    (v_carrera_id, 'Estado y Sociedad', 1, null),
    (v_carrera_id, 'Lenguaje, Lógica y Argumentación', 1, null),
    (v_carrera_id, 'Filosofía y Ética', 1, null),
    (v_carrera_id, 'Introducción a los Sistemas Jurídicos', 1, null),
    (v_carrera_id, 'Derecho Constitucional', 1, null),
    (v_carrera_id, 'Instituciones de Derecho Privado II', 1, null),
    (v_carrera_id, 'Derecho Penal I', 1, null),

    -- Año 2
    (v_carrera_id, 'Teoría General de las Obligaciones', 2, null),
    (v_carrera_id, 'Derechos Humanos', 2, null),
    (v_carrera_id, 'Derecho Internacional Público', 2, null),
    (v_carrera_id, 'Derecho Penal II', 2, null),
    (v_carrera_id, 'Derecho Procesal Civil y Comercial', 2, null),
    (v_carrera_id, 'Inglés', 2, null),
    (v_carrera_id, 'Derecho de Daños', 2, null),
    (v_carrera_id, 'Práctica y Estrategia Procesal', 2, null),
    (v_carrera_id, 'Derecho del Trabajo y de la Seguridad Social', 2, null),
    (v_carrera_id, 'Derecho Procesal Penal', 2, null),

    -- Año 3
    (v_carrera_id, 'Teoría General de los Contratos', 3, null),
    (v_carrera_id, 'Personas Jurídicas Privadas', 3, null),
    (v_carrera_id, 'Filosofía del Derecho', 3, null),
    (v_carrera_id, 'Derecho Administrativo', 3, null),
    (v_carrera_id, 'Derechos Reales', 3, null),
    (v_carrera_id, 'Metodología de la Investigación Jurídica', 3, null),
    (v_carrera_id, 'Títulos Valores y Concursos', 3, null),
    (v_carrera_id, 'Contratos Civiles y Comerciales', 3, null),
    (v_carrera_id, 'Derecho Financiero y Tributario', 3, null),
    (v_carrera_id, 'Economía y Análisis Económico del Derecho', 3, null),

    -- Año 4
    (v_carrera_id, 'Resolución de Controversias', 4, null),
    (v_carrera_id, 'Derecho de Familia', 4, null),
    (v_carrera_id, 'Derecho Informático y de la Propiedad Intelectual', 4, null),
    (v_carrera_id, 'Derecho Internacional Privado', 4, null),
    (v_carrera_id, 'Derecho Ambiental', 4, null),
    (v_carrera_id, 'Derecho del Consumidor', 4, null),
    (v_carrera_id, 'Derecho Aduanero, de la Navegación y Aeronáutico', 4, null),
    (v_carrera_id, 'Derecho de Sucesiones', 4, null),
    (v_carrera_id, 'Práctica y Ética Profesional', 4, null);
end $$;


-- ============================================================
-- Carrera 4: ITBA — Ingeniería Industrial
-- horas_catedra NULL en todas (mismo criterio que ITBA Informática, ya
-- cargada — el plan oficial no publica horas por materia). Excluido
-- Proyecto Final de Ingeniería Industrial. Mismo gap que Informática: el
-- plan menciona un bloque de "Electivas" en 4to año sin especificar cuántas
-- son obligatorias — no se incluye ningún bloque de electivas por ese
-- motivo. Tampoco se incluye el requisito de 2 niveles de inglés.
-- ============================================================
insert into carreras (universidad, nombre, nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora)
select 'ITBA', 'Ingeniería Industrial', 6, 8, true, 1
where not exists (
  select 1 from carreras where universidad = 'ITBA' and nombre = 'Ingeniería Industrial'
);

do $$
declare
  v_carrera_id uuid;
begin
  select id into v_carrera_id from carreras where universidad = 'ITBA' and nombre = 'Ingeniería Industrial';

  if v_carrera_id is null then
    raise notice 'No se encontró "Ingeniería Industrial" (ITBA): no se cargan materias.';
    return;
  end if;

  if exists (select 1 from materias_catalogo where carrera_id = v_carrera_id) then
    raise notice 'ITBA Ingeniería Industrial ya tiene materias cargadas: no se vuelve a cargar.';
    return;
  end if;

  insert into materias_catalogo (carrera_id, nombre, anio_cursada, horas_catedra) values
    -- Año 1
    (v_carrera_id, 'Química I', 1, null),
    (v_carrera_id, 'Sistemas de Representación', 1, null),
    (v_carrera_id, 'Matemática I', 1, null),
    (v_carrera_id, 'Álgebra Lineal', 1, null),
    (v_carrera_id, 'Informática General', 1, null),
    (v_carrera_id, 'Química II', 1, null),
    (v_carrera_id, 'Programación Básica', 1, null),
    (v_carrera_id, 'Matemática II', 1, null),
    (v_carrera_id, 'Física I', 1, null),
    (v_carrera_id, 'Formación General I', 1, null),

    -- Año 2
    (v_carrera_id, 'Estática y Resistencia de Materiales', 2, null),
    (v_carrera_id, 'Matemática III', 2, null),
    (v_carrera_id, 'Probabilidad', 2, null),
    (v_carrera_id, 'Física II', 2, null),
    (v_carrera_id, 'Metodología del Aprendizaje', 2, null),
    (v_carrera_id, 'Métodos Numéricos', 2, null),
    (v_carrera_id, 'Matemática IV', 2, null),
    (v_carrera_id, 'Física III', 2, null),
    (v_carrera_id, 'Termodinámica', 2, null),
    (v_carrera_id, 'Mecánica y Mecanismos', 2, null),
    (v_carrera_id, 'Materiales y Procesos', 2, null),

    -- Año 3
    (v_carrera_id, 'Organización de la Producción I', 3, null),
    (v_carrera_id, 'Física IV', 3, null),
    (v_carrera_id, 'Mecánica de Fluidos', 3, null),
    (v_carrera_id, 'Estadística Aplicada I', 3, null),
    (v_carrera_id, 'Electrotecnia', 3, null),
    (v_carrera_id, 'Organización de la Producción II', 3, null),
    (v_carrera_id, 'Electrónica e Instrumentación', 3, null),
    (v_carrera_id, 'Costos Industriales', 3, null),
    (v_carrera_id, 'Máquinas Térmicas', 3, null),
    (v_carrera_id, 'Máquinas Eléctricas', 3, null),
    (v_carrera_id, 'Estadística Aplicada II', 3, null),
    (v_carrera_id, 'Sistemas y Modelos', 3, null),

    -- Año 4
    (v_carrera_id, 'Tecnologías y Procesos de Producción', 4, null),
    (v_carrera_id, 'Investigación de Operaciones I', 4, null),
    (v_carrera_id, 'Sistemas de Información', 4, null),
    (v_carrera_id, 'Presupuesto y Control', 4, null),
    (v_carrera_id, 'Instalaciones Térmicas', 4, null),
    (v_carrera_id, 'Instalaciones Eléctricas', 4, null),
    (v_carrera_id, 'Investigación de Operaciones II', 4, null),
    (v_carrera_id, 'Marketing', 4, null),
    (v_carrera_id, 'Economía', 4, null),
    (v_carrera_id, 'Logística', 4, null),
    (v_carrera_id, 'Gestión de Calidad', 4, null),
    (v_carrera_id, 'Seminarios de Actualización Tecnológica', 4, null),

    -- Año 5
    (v_carrera_id, 'Formulación y Evaluación de Proyectos', 5, null),
    (v_carrera_id, 'Planeamiento Estratégico', 5, null),
    (v_carrera_id, 'Simulación', 5, null),
    (v_carrera_id, 'Gestión Ambiental', 5, null),
    (v_carrera_id, 'Formación para Emprendedores', 5, null),
    (v_carrera_id, 'Gestión de Proyectos', 5, null),
    (v_carrera_id, 'Derecho para Ingenieros', 5, null),
    (v_carrera_id, 'Plantas Industriales', 5, null),
    (v_carrera_id, 'Formación General III', 5, null);
end $$;
