-- facu_puntos — carga el catálogo de cinco carreras nuevas: Universidad
-- Austral (Ingeniería en Informática), ITBA (Ingeniería Informática), UCA
-- (Abogacía), UB (Licenciatura en Relaciones Internacionales) y UCEMA
-- (Licenciatura en Economía).
-- Corré este script completo en el SQL Editor de Supabase. Es seguro
-- correrlo más de una vez: cada carrera se chequea por separado
-- (universidad + nombre) y no duplica ni la carrera ni sus materias si ya
-- están cargadas.
--
-- La mayoría de las materias de este archivo van con horas_catedra en NULL
-- (no se consiguió el dato para esa universidad) — el usuario lo completa a
-- mano la primera vez que clona esa materia, la app ya soporta esto.
--
-- Reglas y puntos: defaults en las cinco (nota_aprobacion 6, nota_promocion
-- 8, permite_promocion true, puntos_por_hora 1, parciales/recup/final en
-- los defaults de la tabla 2/2/4) — nada indica lo contrario en ninguna.


-- ============================================================
-- Carrera 1: Universidad Austral — Ingeniería en Informática
-- horas_catedra NULL en todas: no se encontró ningún dato de horas en
-- ninguna fuente pública. Sin Práctica Profesional Supervisada separada
-- (no se identificó una para esta carrera).
-- ============================================================
insert into carreras (universidad, nombre, nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora)
select 'Universidad Austral', 'Ingeniería en Informática', 6, 8, true, 1
where not exists (
  select 1 from carreras where universidad = 'Universidad Austral' and nombre = 'Ingeniería en Informática'
);

do $$
declare
  v_carrera_id uuid;
begin
  select id into v_carrera_id from carreras
  where universidad = 'Universidad Austral' and nombre = 'Ingeniería en Informática';

  if v_carrera_id is null then
    raise notice 'No se encontró "Ingeniería en Informática" (Universidad Austral): no se cargan materias.';
    return;
  end if;

  if exists (select 1 from materias_catalogo where carrera_id = v_carrera_id) then
    raise notice 'Universidad Austral Ingeniería en Informática ya tiene materias cargadas: no se vuelve a cargar.';
    return;
  end if;

  insert into materias_catalogo (carrera_id, nombre, anio_cursada, horas_catedra) values
    -- Año 1
    (v_carrera_id, 'Análisis Matemático I', 1, null),
    (v_carrera_id, 'Álgebra I', 1, null),
    (v_carrera_id, 'Programación I', 1, null),
    (v_carrera_id, 'Introducción a la Ingeniería', 1, null),
    (v_carrera_id, 'Filosofía General', 1, null),
    (v_carrera_id, 'Análisis Matemático II', 1, null),
    (v_carrera_id, 'Álgebra II', 1, null),
    (v_carrera_id, 'Programación II', 1, null),
    (v_carrera_id, 'Física General', 1, null),
    (v_carrera_id, 'Técnicas Digitales', 1, null),

    -- Año 2
    (v_carrera_id, 'Teoría de la Empresa', 2, null),
    (v_carrera_id, 'Estadística II', 2, null),
    (v_carrera_id, 'Laboratorio I', 2, null),
    (v_carrera_id, 'Redes de Comunicación de Datos', 2, null),
    (v_carrera_id, 'Electrónica Informática', 2, null),
    (v_carrera_id, 'Ética General', 2, null),
    (v_carrera_id, 'Diseño de Sistemas', 2, null),
    (v_carrera_id, 'Laboratorio II', 2, null),
    (v_carrera_id, 'Ingeniería de Sistemas', 2, null),
    (v_carrera_id, 'Lenguajes de Programación', 2, null),
    (v_carrera_id, 'Diseño de Interacción', 2, null),
    (v_carrera_id, 'Moral, Persona y Valores', 2, null),
    (v_carrera_id, 'Investigación Operativa', 2, null),

    -- Año 3
    (v_carrera_id, 'Arquitectura de Computadoras', 3, null),
    (v_carrera_id, 'Análisis Matemático III', 3, null),
    (v_carrera_id, 'Álgebra III', 3, null),
    (v_carrera_id, 'Electricidad y Magnetismo', 3, null),
    (v_carrera_id, 'Algoritmos y Estructuras de Datos', 3, null),
    (v_carrera_id, 'Teología', 3, null),
    (v_carrera_id, 'Cálculo Numérico', 3, null),
    (v_carrera_id, 'Estadística I', 3, null),
    (v_carrera_id, 'Matemática Discreta', 3, null),
    (v_carrera_id, 'Análisis y Diseño de Algoritmos', 3, null),
    (v_carrera_id, 'Antropología', 3, null),
    (v_carrera_id, 'Sistemas Operativos', 3, null),
    (v_carrera_id, 'Bases de Datos', 3, null),

    -- Año 4
    (v_carrera_id, 'Laboratorio III', 4, null),
    (v_carrera_id, 'Programación Concurrente', 4, null),
    (v_carrera_id, 'Aseguramiento de la Calidad de Software', 4, null),
    (v_carrera_id, 'Seguridad Informática', 4, null),
    (v_carrera_id, 'Ética Profesional', 4, null),
    (v_carrera_id, 'Inteligencia Artificial', 4, null),
    (v_carrera_id, 'Sistemas Distribuidos', 4, null),
    (v_carrera_id, 'Comunicación Efectiva', 4, null),
    (v_carrera_id, 'Responsabilidad Social', 4, null),
    (v_carrera_id, 'Legal (Derecho)', 4, null),

    -- Año 5
    (v_carrera_id, 'Laboratorio IV', 5, null),
    (v_carrera_id, 'Factor Humano', 5, null),
    (v_carrera_id, 'Macroeconomía', 5, null),
    (v_carrera_id, 'Dirección de Proyectos', 5, null),
    (v_carrera_id, 'Microeconomía Aplicada', 5, null),
    (v_carrera_id, 'Taller de Expresión Oral y Escrita', 5, null),
    (v_carrera_id, 'Electivas (bloque) — 5to año', 5, 384);
end $$;


-- ============================================================
-- Carrera 2: ITBA — Ingeniería Informática
-- horas_catedra NULL en todas: el PDF oficial del plan no publica carga
-- horaria por materia. Sin bloque de electivas (el plan tiene +90 materias
-- optativas en 5 minors, pero la fuente no dice cuántas son obligatorias —
-- se suma después si se consigue ese número). Excluidas Proyecto Final y
-- Práctica Laboral (trabajo final/práctica sin parciales tradicionales).
-- ============================================================
insert into carreras (universidad, nombre, nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora)
select 'ITBA', 'Ingeniería Informática', 6, 8, true, 1
where not exists (
  select 1 from carreras where universidad = 'ITBA' and nombre = 'Ingeniería Informática'
);

do $$
declare
  v_carrera_id uuid;
begin
  select id into v_carrera_id from carreras where universidad = 'ITBA' and nombre = 'Ingeniería Informática';

  if v_carrera_id is null then
    raise notice 'No se encontró "Ingeniería Informática" (ITBA): no se cargan materias.';
    return;
  end if;

  if exists (select 1 from materias_catalogo where carrera_id = v_carrera_id) then
    raise notice 'ITBA Ingeniería Informática ya tiene materias cargadas: no se vuelve a cargar.';
    return;
  end if;

  insert into materias_catalogo (carrera_id, nombre, anio_cursada, horas_catedra) values
    -- Año 1
    (v_carrera_id, 'Sistemas de Representación', 1, null),
    (v_carrera_id, 'Introducción a la Informática', 1, null),
    (v_carrera_id, 'Análisis Matemático I', 1, null),
    (v_carrera_id, 'Álgebra', 1, null),
    (v_carrera_id, 'Metodología del Aprendizaje', 1, null),
    (v_carrera_id, 'Programación Imperativa', 1, null),
    (v_carrera_id, 'Análisis Matemático II', 1, null),
    (v_carrera_id, 'Física I', 1, null),
    (v_carrera_id, 'Matemática Discreta', 1, null),

    -- Año 2
    (v_carrera_id, 'Química', 2, null),
    (v_carrera_id, 'Diseño y Procesamiento de Documentos XML', 2, null),
    (v_carrera_id, 'Programación Orientada a Objetos', 2, null),
    (v_carrera_id, 'Lógica Computacional', 2, null),
    (v_carrera_id, 'Física III', 2, null),
    (v_carrera_id, 'Arquitectura de Computadoras', 2, null),
    (v_carrera_id, 'Estructura de Datos y Algoritmos', 2, null),
    (v_carrera_id, 'Probabilidad y Estadística', 2, null),
    (v_carrera_id, 'Física II', 2, null),

    -- Año 3
    (v_carrera_id, 'Sistemas Operativos', 3, null),
    (v_carrera_id, 'Ingeniería de Software I', 3, null),
    (v_carrera_id, 'Interacción Hombre-Computadora (HCI)', 3, null),
    (v_carrera_id, 'Base de Datos I', 3, null),
    (v_carrera_id, 'Protocolos de Comunicación', 3, null),
    (v_carrera_id, 'Proyecto de Aplicaciones Web', 3, null),
    (v_carrera_id, 'Autómatas, Teoría de Lenguaje y Compiladores', 3, null),
    (v_carrera_id, 'Métodos Numéricos', 3, null),
    (v_carrera_id, 'Formación General I', 3, null),

    -- Año 4
    (v_carrera_id, 'Economía para Ingenieros', 4, null),
    (v_carrera_id, 'Derecho para Ingenieros', 4, null),
    (v_carrera_id, 'Ingeniería del Software II', 4, null),
    (v_carrera_id, 'Simulación de Sistemas', 4, null),
    (v_carrera_id, 'Sistemas de Inteligencia Artificial', 4, null),
    (v_carrera_id, 'Gestión de Proyectos Informáticos', 4, null),

    -- Año 5
    (v_carrera_id, 'Base de Datos II', 5, null),
    (v_carrera_id, 'Programación de Objetos Distribuidos', 5, null),
    (v_carrera_id, 'Métodos Numéricos Avanzados', 5, null),
    (v_carrera_id, 'Criptografía y Seguridad', 5, null),
    (v_carrera_id, 'Seguridad Ocupacional y Ambiental', 5, null),
    (v_carrera_id, 'Redes de Información', 5, null),
    (v_carrera_id, 'Formación General III', 5, null);
end $$;


-- ============================================================
-- Carrera 3: UCA — Abogacía
-- horas_catedra NULL en todas: la fuente (Plan 2013) da una columna de
-- horas pero no aclara la unidad y los valores (3-6) son demasiado chicos
-- para un total de cuatrimestre — mejor no cargar un número mal escalado.
-- Aviso de vigencia: existe un "Plan 2020" (al menos para Buenos Aires) que
-- reemplazó a este; no se consiguió su desglose completo. Excluidos los 3
-- "Seminario de Práctica Profesional" (D. Civil/Comercial/Laboral;
-- Empresarial; D. Público/Penal) y los 2 "Idioma" — el resto de los
-- "Seminario I-V" (sin "Práctica Profesional") sí se cargan, son distintos.
-- ============================================================
insert into carreras (universidad, nombre, nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora)
select 'UCA', 'Abogacía', 6, 8, true, 1
where not exists (
  select 1 from carreras where universidad = 'UCA' and nombre = 'Abogacía'
);

do $$
declare
  v_carrera_id uuid;
begin
  select id into v_carrera_id from carreras where universidad = 'UCA' and nombre = 'Abogacía';

  if v_carrera_id is null then
    raise notice 'No se encontró "Abogacía" (UCA): no se cargan materias.';
    return;
  end if;

  if exists (select 1 from materias_catalogo where carrera_id = v_carrera_id) then
    raise notice 'UCA Abogacía ya tiene materias cargadas: no se vuelve a cargar.';
    return;
  end if;

  insert into materias_catalogo (carrera_id, nombre, anio_cursada, horas_catedra) values
    -- Año 1
    (v_carrera_id, 'Filosofía y Antropología', 1, null),
    (v_carrera_id, 'Introducción al Derecho', 1, null),
    (v_carrera_id, 'Historia de la Cultura', 1, null),
    (v_carrera_id, 'Principios de Derecho Privado', 1, null),
    (v_carrera_id, 'Formación del Pensamiento Jurídico-Político', 1, null),
    (v_carrera_id, 'Instituciones de Derecho Civil', 1, null),
    (v_carrera_id, 'Historia del Derecho', 1, null),
    (v_carrera_id, 'Derecho Romano', 1, null),
    (v_carrera_id, 'Seminario I', 1, null),

    -- Año 2
    (v_carrera_id, 'Ética y sus Fundamentos', 2, null),
    (v_carrera_id, 'Instituciones de Derecho Comercial', 2, null),
    (v_carrera_id, 'Obligaciones Civiles y Comerciales', 2, null),
    (v_carrera_id, 'Derecho Político', 2, null),
    (v_carrera_id, 'Economía Política', 2, null),
    (v_carrera_id, 'Teoría General del Proceso', 2, null),
    (v_carrera_id, 'Derecho Penal (Parte General)', 2, null),
    (v_carrera_id, 'Derecho de Daños', 2, null),
    (v_carrera_id, 'Seminario II', 2, null),

    -- Año 3
    (v_carrera_id, 'Introducción a la Teología', 3, null),
    (v_carrera_id, 'Derecho Procesal Penal', 3, null),
    (v_carrera_id, 'Contratos Civiles y Comerciales (Parte General)', 3, null),
    (v_carrera_id, 'Derecho Penal (Parte Especial)', 3, null),
    (v_carrera_id, 'Derecho Constitucional', 3, null),
    (v_carrera_id, 'Derechos y Garantías Constitucionales', 3, null),
    (v_carrera_id, 'Derecho del Trabajo y de la Seguridad Social', 3, null),
    (v_carrera_id, 'Contratos Civiles y Comerciales (Parte Especial)', 3, null),
    (v_carrera_id, 'Derecho Societario', 3, null),
    (v_carrera_id, 'Seminario III', 3, null),

    -- Año 4
    (v_carrera_id, 'Síntesis Teológica', 4, null),
    (v_carrera_id, 'Derechos Reales (Parte General)', 4, null),
    (v_carrera_id, 'Títulos Valores', 4, null),
    (v_carrera_id, 'Seminario de Responsabilidades Especiales y Seguros', 4, null),
    (v_carrera_id, 'Derecho Procesal Civil y Comercial', 4, null),
    (v_carrera_id, 'Concursos y Quiebras', 4, null),
    (v_carrera_id, 'Derecho Internacional Público', 4, null),
    (v_carrera_id, 'Derechos Reales (Parte Especial)', 4, null),
    (v_carrera_id, 'Seminario IV', 4, null),

    -- Año 5
    (v_carrera_id, 'Moral y Compromiso Social', 5, null),
    (v_carrera_id, 'Derecho de Familia', 5, null),
    (v_carrera_id, 'Seminario de Derecho Tributario', 5, null),
    (v_carrera_id, 'Instituciones de Derecho Administrativo', 5, null),
    (v_carrera_id, 'Filosofía del Derecho', 5, null),
    (v_carrera_id, 'Derecho Internacional Privado', 5, null),
    (v_carrera_id, 'Derecho Sucesorio', 5, null),
    (v_carrera_id, 'Derecho Administrativo Especial', 5, null),
    (v_carrera_id, 'Derecho Canónico', 5, null),
    (v_carrera_id, 'Seminario de Ética Social y Profesional', 5, null),
    (v_carrera_id, 'Seminario V', 5, null),
    (v_carrera_id, 'Electivas (bloque, 2 materias) — 5to año', 5, null);
end $$;


-- ============================================================
-- Carrera 4: UB (Universidad de Belgrano) — Licenciatura en Relaciones
-- Internacionales
-- Horas cátedra reales (fuente: PDF de contenidos mínimos, por tener el
-- desglose de horas — la página del plan lista materias levemente
-- distintas en 3er/4to año, avisado acá por si algo no encaja con un
-- usuario real). Excluidas Trabajo Social Profesional (práctica, hs reloj
-- sin desglose cátedra) y Desarrollo y Defensa del Trabajo Final de Carrera
-- (tesina, distinta del "Taller de Trabajo Final de Carrera" de 4to año,
-- que sí es cursada regular y se carga normal).
-- ============================================================
insert into carreras (universidad, nombre, nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora)
select 'UB', 'Licenciatura en Relaciones Internacionales', 6, 8, true, 1
where not exists (
  select 1 from carreras where universidad = 'UB' and nombre = 'Licenciatura en Relaciones Internacionales'
);

do $$
declare
  v_carrera_id uuid;
begin
  select id into v_carrera_id from carreras
  where universidad = 'UB' and nombre = 'Licenciatura en Relaciones Internacionales';

  if v_carrera_id is null then
    raise notice 'No se encontró "Licenciatura en Relaciones Internacionales" (UB): no se cargan materias.';
    return;
  end if;

  if exists (select 1 from materias_catalogo where carrera_id = v_carrera_id) then
    raise notice 'UB Relaciones Internacionales ya tiene materias cargadas: no se vuelve a cargar.';
    return;
  end if;

  insert into materias_catalogo (carrera_id, nombre, anio_cursada, horas_catedra) values
    -- Año 1
    (v_carrera_id, 'Introducción a la Ciencia Política', 1, 80),
    (v_carrera_id, 'Introducción a las Relaciones Internacionales', 1, 80),
    (v_carrera_id, 'Evolución del Pensamiento Filosófico y Político I', 1, 64),
    (v_carrera_id, 'Evolución del Pensamiento Filosófico y Político II', 1, 64),
    (v_carrera_id, 'Historia Política y Social Contemporánea I', 1, 64),
    (v_carrera_id, 'Historia Política y Social Contemporánea II', 1, 64),
    (v_carrera_id, 'Sociología General', 1, 64),
    (v_carrera_id, 'Derecho Constitucional', 1, 64),
    (v_carrera_id, 'Principios de Economía', 1, 64),
    (v_carrera_id, 'Metodología de la Investigación en Ciencias Sociales', 1, 48),
    (v_carrera_id, 'Taller de Escritura y Oratoria', 1, 32),

    -- Año 2
    (v_carrera_id, 'Teoría de la Ciencia Política I', 2, 64),
    (v_carrera_id, 'Teoría de la Ciencia Política II', 2, 64),
    (v_carrera_id, 'Teoría de las Relaciones Internacionales I', 2, 64),
    (v_carrera_id, 'Teoría de las Relaciones Internacionales II', 2, 48),
    (v_carrera_id, 'Historia Política y Social Latinoamericana', 2, 80),
    (v_carrera_id, 'Historia Política y Social Argentina', 2, 80),
    (v_carrera_id, 'Derecho Internacional Público', 2, 64),
    (v_carrera_id, 'Análisis Económico y Estadístico', 2, 64),
    (v_carrera_id, 'Práctica Profesional (Partidos Políticos)', 2, 36),
    (v_carrera_id, 'Electiva de Formación General (bloque, 1 materia) — 2do año', 2, 32),

    -- Año 3
    (v_carrera_id, 'Técnicas de Análisis de la Realidad Política Nacional e Internacional I', 3, 64),
    (v_carrera_id, 'Técnicas de Análisis de la Realidad Política Nacional e Internacional II', 3, 64),
    (v_carrera_id, 'Movimientos Políticos y Sociales Contemporáneos', 3, 64),
    (v_carrera_id, 'Sistemas Políticos y Electorales Comparados', 3, 64),
    (v_carrera_id, 'Política de África, Asia y Oceanía', 3, 64),
    (v_carrera_id, 'Política Exterior Argentina y Americana', 3, 64),
    (v_carrera_id, 'Psicología Política y Liderazgo', 3, 64),
    (v_carrera_id, 'Relaciones Institucionales', 3, 64),
    (v_carrera_id, 'Habilitación Profesional I', 3, 64),
    (v_carrera_id, 'Electiva de Formación General (bloque, 1 materia) — 3er año', 3, 32),

    -- Año 4
    (v_carrera_id, 'Organismos Internacionales', 4, 64),
    (v_carrera_id, 'Estructura Económica Internacional e Integración Regional', 4, 64),
    (v_carrera_id, 'Derecho Internacional Privado y Contratos Internacionales', 4, 64),
    (v_carrera_id, 'Tendencias Estratégicas Globales y Geopolítica', 4, 64),
    (v_carrera_id, 'Teoría y Práctica Diplomática y Consular', 4, 64),
    (v_carrera_id, 'Conflictos Internacionales y Seguridad Global', 4, 64),
    (v_carrera_id, 'Relaciones Internacionales de América Latina', 4, 64),
    (v_carrera_id, 'Habilitación Profesional II', 4, 64),
    (v_carrera_id, 'Taller de Trabajo Final de Carrera', 4, 32),
    (v_carrera_id, 'Electiva de Formación Específica (bloque, 1 materia) — 4to año', 4, 64);
end $$;


-- ============================================================
-- Carrera 5: UCEMA — Licenciatura en Economía
-- horas_catedra NULL en todas: ninguna fuente publica carga horaria. No se
-- identificó práctica profesional, pasantía, trabajo final ni examen de
-- idioma para excluir en esta carrera.
-- ============================================================
insert into carreras (universidad, nombre, nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora)
select 'UCEMA', 'Licenciatura en Economía', 6, 8, true, 1
where not exists (
  select 1 from carreras where universidad = 'UCEMA' and nombre = 'Licenciatura en Economía'
);

do $$
declare
  v_carrera_id uuid;
begin
  select id into v_carrera_id from carreras where universidad = 'UCEMA' and nombre = 'Licenciatura en Economía';

  if v_carrera_id is null then
    raise notice 'No se encontró "Licenciatura en Economía" (UCEMA): no se cargan materias.';
    return;
  end if;

  if exists (select 1 from materias_catalogo where carrera_id = v_carrera_id) then
    raise notice 'UCEMA Licenciatura en Economía ya tiene materias cargadas: no se vuelve a cargar.';
    return;
  end if;

  insert into materias_catalogo (carrera_id, nombre, anio_cursada, horas_catedra) values
    -- Año 1
    (v_carrera_id, 'Análisis Matemático', 1, null),
    (v_carrera_id, 'Álgebra Lineal', 1, null),
    (v_carrera_id, 'Elementos de Administración', 1, null),
    (v_carrera_id, 'Elementos de Contabilidad', 1, null),
    (v_carrera_id, 'Elementos de Ciencias Políticas', 1, null),
    (v_carrera_id, 'Lógica y Metodología de las Ciencias', 1, null),
    (v_carrera_id, 'Introducción al Pensamiento Computacional', 1, null),
    (v_carrera_id, 'Principios de Microeconomía', 1, null),
    (v_carrera_id, 'Principios de Macroeconomía', 1, null),
    (v_carrera_id, 'Taller de Aplicación I', 1, null),
    (v_carrera_id, 'Taller de Aplicación II', 1, null),

    -- Año 2
    (v_carrera_id, 'Historia', 2, null),
    (v_carrera_id, 'Introducción a la Probabilidad y Estadística', 2, null),
    (v_carrera_id, 'Información Financiera y Gerencial de la Empresa', 2, null),
    (v_carrera_id, 'Microeconomía Intermedia', 2, null),
    (v_carrera_id, 'Análisis Matemático Multivariado', 2, null),
    (v_carrera_id, 'Estadística para la Toma de Decisiones', 2, null),
    (v_carrera_id, 'Historia del Pensamiento Económico y Social', 2, null),
    (v_carrera_id, 'Macroeconomía Intermedia', 2, null),
    (v_carrera_id, 'Taller de Aplicación III', 2, null),

    -- Año 3
    (v_carrera_id, 'Econometría', 3, null),
    (v_carrera_id, 'Macroeconomía Avanzada', 3, null),
    (v_carrera_id, 'Microeconomía Avanzada', 3, null),
    (v_carrera_id, 'Comercio Internacional', 3, null),
    (v_carrera_id, 'Economía Laboral', 3, null),
    (v_carrera_id, 'Economía Monetaria', 3, null),
    (v_carrera_id, 'Electiva (bloque, 1 materia) — 3er año', 3, null),

    -- Año 4
    (v_carrera_id, 'Crecimiento Económico', 4, null),
    (v_carrera_id, 'Economía Monetaria Internacional', 4, null),
    (v_carrera_id, 'Organización Industrial', 4, null),
    (v_carrera_id, 'Finanzas Públicas', 4, null),
    (v_carrera_id, 'Teoría del Desarrollo', 4, null),
    (v_carrera_id, 'Tópicos Avanzados en Finanzas', 4, null),
    (v_carrera_id, 'Electivas (bloque, 2 materias) — 4to año', 4, null);
end $$;
