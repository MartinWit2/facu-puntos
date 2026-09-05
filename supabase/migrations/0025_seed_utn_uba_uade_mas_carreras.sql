-- facu_puntos — carga el catálogo de siete carreras nuevas: UTN FRBA
-- (Ingeniería Civil, Eléctrica, Electrónica y Química), UBA Ingeniería
-- Civil (FIUBA), y UADE (Contador Público e Ingeniería Industrial).
-- Corré este script completo en el SQL Editor de Supabase. Es seguro
-- correrlo más de una vez: cada carrera se chequea por separado
-- (universidad + nombre) y no duplica ni la carrera ni sus materias si ya
-- están cargadas.
--
-- Reglas y puntos: defaults en las siete (nota_aprobacion 6, nota_promocion
-- 8, permite_promocion true, puntos_por_hora 1, parciales/recup/final en
-- los defaults de la tabla 2/2/4).


-- ============================================================
-- Carrera 1: UTN — Ingeniería Civil (FRBA, Plan 2023, Ordenanza 1853)
-- Horas cátedra reales: la fuente da hs/semana confirmadas, convertidas con
-- la misma fórmula ya validada para Sistemas/Industrial (×32 semanas para
-- materias anuales — Niveles 1 a 5 —, ×16 para el bloque semestral final
-- de Nivel 6), verificada contra la columna de horas reloj de la fuente.
-- Excluido Proyecto Final (actividad de cierre, no cursada con parciales).
-- La PPS es un requisito aparte de la tabla de materias, no hay fila que
-- excluir por ese motivo.
-- ============================================================
insert into carreras (universidad, nombre, nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora)
select 'UTN', 'Ingeniería Civil', 6, 8, true, 1
where not exists (
  select 1 from carreras where universidad = 'UTN' and nombre = 'Ingeniería Civil'
);

do $$
declare
  v_carrera_id uuid;
begin
  select id into v_carrera_id from carreras where universidad = 'UTN' and nombre = 'Ingeniería Civil';

  if v_carrera_id is null then
    raise notice 'No se encontró "Ingeniería Civil" (UTN): no se cargan materias.';
    return;
  end if;

  if exists (select 1 from materias_catalogo where carrera_id = v_carrera_id) then
    raise notice 'UTN Ingeniería Civil ya tiene materias cargadas: no se vuelve a cargar.';
    return;
  end if;

  insert into materias_catalogo (carrera_id, nombre, anio_cursada, horas_catedra) values
    -- Nivel 1
    (v_carrera_id, 'Análisis Matemático I', 1, 160),
    (v_carrera_id, 'Álgebra y Geometría Analítica', 1, 160),
    (v_carrera_id, 'Ingeniería y Sociedad', 1, 64),
    (v_carrera_id, 'Ingeniería Civil I', 1, 96),
    (v_carrera_id, 'Sistemas de Representación', 1, 96),
    (v_carrera_id, 'Química General', 1, 160),
    (v_carrera_id, 'Física I', 1, 160),
    (v_carrera_id, 'Fundamentos de Informática', 1, 64),

    -- Nivel 2
    (v_carrera_id, 'Análisis Matemático II', 2, 160),
    (v_carrera_id, 'Estabilidad', 2, 160),
    (v_carrera_id, 'Ingeniería Civil II', 2, 96),
    (v_carrera_id, 'Tecnología de los Materiales', 2, 128),
    (v_carrera_id, 'Física II', 2, 160),
    (v_carrera_id, 'Probabilidad y Estadística', 2, 96),
    (v_carrera_id, 'Inglés I', 2, 64),

    -- Nivel 3
    (v_carrera_id, 'Resistencia de Materiales', 3, 128),
    (v_carrera_id, 'Tecnología del Hormigón', 3, 64),
    (v_carrera_id, 'Tecnología de la Construcción', 3, 192),
    (v_carrera_id, 'Geotopografía', 3, 128),
    (v_carrera_id, 'Hidráulica General y Aplicada', 3, 160),
    (v_carrera_id, 'Cálculo Avanzado', 3, 64),
    (v_carrera_id, 'Instalaciones Eléctricas y Acústicas', 3, 64),
    (v_carrera_id, 'Instalaciones Termomecánicas', 3, 64),
    (v_carrera_id, 'Economía', 3, 96),
    (v_carrera_id, 'Inglés II', 3, 64),

    -- Nivel 4
    (v_carrera_id, 'Geotecnia', 4, 160),
    (v_carrera_id, 'Instalaciones Sanitarias y de Gas', 4, 96),
    (v_carrera_id, 'Diseño Arquitectónico, Planeamiento y Urbanismo', 4, 160),
    (v_carrera_id, 'Análisis Estructural I', 4, 160),
    (v_carrera_id, 'Estructuras de Hormigón', 4, 160),
    (v_carrera_id, 'Hidrología y Obras Hidráulicas', 4, 128),
    (v_carrera_id, 'Ingeniería Legal', 4, 96),

    -- Nivel 5
    (v_carrera_id, 'Construcciones Metálicas y de Madera', 5, 128),
    (v_carrera_id, 'Cimentaciones', 5, 96),
    (v_carrera_id, 'Ingeniería Sanitaria', 5, 96),
    (v_carrera_id, 'Organización y Conducción de Obras', 5, 160),
    (v_carrera_id, 'Vías de Comunicación I', 5, 128),
    (v_carrera_id, 'Análisis Estructural II', 5, 160),
    (v_carrera_id, 'Vías de Comunicación II', 5, 128),
    (v_carrera_id, 'Gestión Ambiental y Desarrollo Sustentable', 5, 96),

    -- Nivel 6
    (v_carrera_id, 'Electivas (bloque) — Nivel 6', 6, 352);
end $$;


-- ============================================================
-- Carrera 2: UTN — Ingeniería Eléctrica (FRBA)
-- horas_catedra NULL en todas: hay una fuente con horas semanales (FR
-- General Pacheco) pero no coincide con el orden por nivel de FRBA para las
-- mismas materias — mejor no mezclar fuentes que no concuerdan; se usa la
-- estructura oficial de FRBA sin las horas. FRBA no dicta "Ingeniería
-- Electromecánica" como carrera separada, por eso "Ingeniería Eléctrica".
-- Excluido Proyecto Final (Integradora, Nivel V). La PPS es un requisito
-- aparte, no aparece como fila.
-- ============================================================
insert into carreras (universidad, nombre, nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora)
select 'UTN', 'Ingeniería Eléctrica', 6, 8, true, 1
where not exists (
  select 1 from carreras where universidad = 'UTN' and nombre = 'Ingeniería Eléctrica'
);

do $$
declare
  v_carrera_id uuid;
begin
  select id into v_carrera_id from carreras where universidad = 'UTN' and nombre = 'Ingeniería Eléctrica';

  if v_carrera_id is null then
    raise notice 'No se encontró "Ingeniería Eléctrica" (UTN): no se cargan materias.';
    return;
  end if;

  if exists (select 1 from materias_catalogo where carrera_id = v_carrera_id) then
    raise notice 'UTN Ingeniería Eléctrica ya tiene materias cargadas: no se vuelve a cargar.';
    return;
  end if;

  insert into materias_catalogo (carrera_id, nombre, anio_cursada, horas_catedra) values
    -- Nivel I
    (v_carrera_id, 'Análisis Matemático I', 1, null),
    (v_carrera_id, 'Álgebra y Geometría Analítica', 1, null),
    (v_carrera_id, 'Ingeniería y Sociedad', 1, null),
    (v_carrera_id, 'Sistemas de Representación', 1, null),
    (v_carrera_id, 'Física I', 1, null),
    (v_carrera_id, 'Química General', 1, null),
    (v_carrera_id, 'Integración Eléctrica I (Integradora)', 1, null),
    (v_carrera_id, 'Fundamentos de Informática', 1, null),

    -- Nivel II
    (v_carrera_id, 'Física II', 2, null),
    (v_carrera_id, 'Probabilidad y Estadística', 2, null),
    (v_carrera_id, 'Electrotecnia I', 2, null),
    (v_carrera_id, 'Estabilidad', 2, null),
    (v_carrera_id, 'Mecánica Técnica', 2, null),
    (v_carrera_id, 'Integración Eléctrica II (Integradora)', 2, null),
    (v_carrera_id, 'Inglés I', 2, null),
    (v_carrera_id, 'Análisis Matemático II', 2, null),
    (v_carrera_id, 'Cálculo Numérico', 2, null),

    -- Nivel III
    (v_carrera_id, 'Tecnología y Ensayos de Materiales Eléctricos', 3, null),
    (v_carrera_id, 'Instrumentos y Mediciones Eléctricas', 3, null),
    (v_carrera_id, 'Teoría de los Campos', 3, null),
    (v_carrera_id, 'Física III', 3, null),
    (v_carrera_id, 'Máquinas Eléctricas I (Integradora)', 3, null),
    (v_carrera_id, 'Electrotecnia II', 3, null),
    (v_carrera_id, 'Termodinámica', 3, null),
    (v_carrera_id, 'Fundamentos para el Análisis de Señales', 3, null),

    -- Nivel IV
    (v_carrera_id, 'Inglés II', 4, null),
    (v_carrera_id, 'Economía', 4, null),
    (v_carrera_id, 'Electrónica I', 4, null),
    (v_carrera_id, 'Máquinas Eléctricas II', 4, null),
    (v_carrera_id, 'Seguridad, Riesgo Eléctrico y Medio Ambiente', 4, null),
    (v_carrera_id, 'Instalaciones Eléctricas y Luminotecnia (Integradora)', 4, null),
    (v_carrera_id, 'Control Automático', 4, null),
    (v_carrera_id, 'Máquinas Térmicas, Hidráulicas y de Fluidos', 4, null),
    (v_carrera_id, 'Legislación', 4, null),

    -- Nivel V
    (v_carrera_id, 'Electrónica II', 5, null),
    (v_carrera_id, 'Generación, Transmisión y Distribución de la Energía Eléctrica', 5, null),
    (v_carrera_id, 'Sistemas de Potencia', 5, null),
    (v_carrera_id, 'Accionamientos y Controles Eléctricos', 5, null),
    (v_carrera_id, 'Organización y Administración de Empresas', 5, null),
    (v_carrera_id, 'Electivas (bloque) — Nivel V', 5, null);
end $$;


-- ============================================================
-- Carrera 3: UTN — Ingeniería Electrónica (FRBA, Plan 2023)
-- Horas cátedra reales: hs/semana × 32 (todas las materias del plan son
-- anuales), verificado contra la columna de horas reloj de la fuente.
-- Excluido Proyecto Final (Nivel 6). La PPS es un requisito aparte, no
-- aparece como fila.
-- ============================================================
insert into carreras (universidad, nombre, nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora)
select 'UTN', 'Ingeniería Electrónica', 6, 8, true, 1
where not exists (
  select 1 from carreras where universidad = 'UTN' and nombre = 'Ingeniería Electrónica'
);

do $$
declare
  v_carrera_id uuid;
begin
  select id into v_carrera_id from carreras where universidad = 'UTN' and nombre = 'Ingeniería Electrónica';

  if v_carrera_id is null then
    raise notice 'No se encontró "Ingeniería Electrónica" (UTN): no se cargan materias.';
    return;
  end if;

  if exists (select 1 from materias_catalogo where carrera_id = v_carrera_id) then
    raise notice 'UTN Ingeniería Electrónica ya tiene materias cargadas: no se vuelve a cargar.';
    return;
  end if;

  insert into materias_catalogo (carrera_id, nombre, anio_cursada, horas_catedra) values
    -- Nivel 1
    (v_carrera_id, 'Informática I', 1, 160),
    (v_carrera_id, 'Álgebra y Geometría Analítica', 1, 160),
    (v_carrera_id, 'Análisis Matemático I', 1, 160),
    (v_carrera_id, 'Ingeniería y Sociedad', 1, 64),
    (v_carrera_id, 'Análisis Matemático II', 1, 160),
    (v_carrera_id, 'Física I', 1, 160),
    (v_carrera_id, 'Diseño Asistido por Computadora', 1, 96),

    -- Nivel 2
    (v_carrera_id, 'Informática II', 2, 160),
    (v_carrera_id, 'Análisis de Señales y Sistemas', 2, 192),
    (v_carrera_id, 'Química General', 2, 160),
    (v_carrera_id, 'Física II', 2, 160),
    (v_carrera_id, 'Probabilidad y Estadística', 2, 96),
    (v_carrera_id, 'Física Electrónica', 2, 160),
    (v_carrera_id, 'Inglés I', 2, 64),

    -- Nivel 3
    (v_carrera_id, 'Teoría de los Circuitos I', 3, 192),
    (v_carrera_id, 'Técnicas Digitales I', 3, 128),
    (v_carrera_id, 'Dispositivos Electrónicos', 3, 160),
    (v_carrera_id, 'Legislación', 3, 64),
    (v_carrera_id, 'Electrónica Aplicada I', 3, 160),
    (v_carrera_id, 'Medios de Enlace', 3, 128),
    (v_carrera_id, 'Inglés II', 3, 64),

    -- Nivel 4
    (v_carrera_id, 'Técnicas Digitales II', 4, 160),
    (v_carrera_id, 'Medidas Electrónicas I', 4, 160),
    (v_carrera_id, 'Teoría de los Circuitos II', 4, 160),
    (v_carrera_id, 'Máquinas e Instalaciones Eléctricas', 4, 128),
    (v_carrera_id, 'Sistemas de Comunicaciones', 4, 128),
    (v_carrera_id, 'Electrónica Aplicada II', 4, 160),
    (v_carrera_id, 'Seguridad, Higiene y Medio Ambiente', 4, 64),

    -- Nivel 5
    (v_carrera_id, 'Técnicas Digitales III', 5, 160),
    (v_carrera_id, 'Medidas Electrónicas II', 5, 160),
    (v_carrera_id, 'Sistemas de Control', 5, 128),
    (v_carrera_id, 'Electrónica Aplicada III', 5, 160),
    (v_carrera_id, 'Tecnología Electrónica', 5, 160),
    (v_carrera_id, 'Electrónica de Potencia', 5, 128),
    (v_carrera_id, 'Organización Industrial', 5, 64),

    -- Nivel 6
    (v_carrera_id, 'Economía', 6, 96),
    (v_carrera_id, 'Electivas (bloque) — Nivel 6', 6, 256);
end $$;


-- ============================================================
-- Carrera 4: UTN — Ingeniería Química (FRBA, Plan 2023)
-- Horas cátedra convertidas: la fuente da 3 columnas por materia (anual +
-- 1°C + 2°C) — el régimen se dedujo del patrón de columnas y se aplicó la
-- misma fórmula ×32/×16, verificada contra los totales de fila del PDF.
-- Confianza algo menor que Civil/Electrónica por esta interpretación
-- extra. Excluido Proyecto Final (Nivel 5). La PPS es un requisito aparte,
-- no aparece como fila.
-- ============================================================
insert into carreras (universidad, nombre, nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora)
select 'UTN', 'Ingeniería Química', 6, 8, true, 1
where not exists (
  select 1 from carreras where universidad = 'UTN' and nombre = 'Ingeniería Química'
);

do $$
declare
  v_carrera_id uuid;
begin
  select id into v_carrera_id from carreras where universidad = 'UTN' and nombre = 'Ingeniería Química';

  if v_carrera_id is null then
    raise notice 'No se encontró "Ingeniería Química" (UTN): no se cargan materias.';
    return;
  end if;

  if exists (select 1 from materias_catalogo where carrera_id = v_carrera_id) then
    raise notice 'UTN Ingeniería Química ya tiene materias cargadas: no se vuelve a cargar.';
    return;
  end if;

  insert into materias_catalogo (carrera_id, nombre, anio_cursada, horas_catedra) values
    -- Nivel 1
    (v_carrera_id, 'Introducción a la Ingeniería Química', 1, 96),
    (v_carrera_id, 'Sistemas de Representación', 1, 64),
    (v_carrera_id, 'Inglés I', 1, 64),
    (v_carrera_id, 'Ingeniería y Sociedad', 1, 64),
    (v_carrera_id, 'Álgebra y Geometría Analítica', 1, 160),
    (v_carrera_id, 'Análisis Matemático I', 1, 160),
    (v_carrera_id, 'Análisis Matemático II', 1, 160),
    (v_carrera_id, 'Química General', 1, 160),
    (v_carrera_id, 'Fundamentos de Informática', 1, 64),

    -- Nivel 2
    (v_carrera_id, 'Introducción a Equipos y Procesos', 2, 96),
    (v_carrera_id, 'Química Orgánica', 2, 160),
    (v_carrera_id, 'Química Inorgánica', 2, 128),
    (v_carrera_id, 'Inglés II', 2, 64),
    (v_carrera_id, 'Física I', 2, 160),
    (v_carrera_id, 'Probabilidad y Estadística', 2, 96),
    (v_carrera_id, 'Física II', 2, 160),
    (v_carrera_id, 'Matemática Superior Aplicada', 2, 96),

    -- Nivel 3
    (v_carrera_id, 'Balance de Masa y Energía', 3, 96),
    (v_carrera_id, 'Economía', 3, 96),
    (v_carrera_id, 'Química Aplicada', 3, 64),
    (v_carrera_id, 'Termodinámica', 3, 128),
    (v_carrera_id, 'Ciencia de los Materiales', 3, 64),
    (v_carrera_id, 'Química Analítica', 3, 128),
    (v_carrera_id, 'Microbiología y Química Biológica', 3, 96),
    (v_carrera_id, 'Fisicoquímica', 3, 128),
    (v_carrera_id, 'Legislación', 3, 64),
    (v_carrera_id, 'Fenómenos de Transporte', 3, 160),

    -- Nivel 4
    (v_carrera_id, 'Diseño, Simulación y Optimización y Seguridad de Procesos', 4, 128),
    (v_carrera_id, 'Operaciones Unitarias I', 4, 160),
    (v_carrera_id, 'Tecnología de la Energía Térmica', 4, 160),
    (v_carrera_id, 'Organización Industrial', 4, 96),
    (v_carrera_id, 'Ingeniería de las Reacciones Químicas', 4, 160),
    (v_carrera_id, 'Operaciones Unitarias II', 4, 160),
    (v_carrera_id, 'Mecánica Industrial', 4, 96),

    -- Nivel 5
    (v_carrera_id, 'Procesos Biotecnológicos', 5, 96),
    (v_carrera_id, 'Control Automático de Procesos', 5, 128),
    (v_carrera_id, 'Máquinas e Instalaciones Eléctricas', 5, 64),
    (v_carrera_id, 'Calidad y Control Estadístico de Procesos', 5, 96),
    (v_carrera_id, 'Ingeniería Ambiental', 5, 96),
    (v_carrera_id, 'Higiene y Seguridad en el Trabajo', 5, 64),
    (v_carrera_id, 'Electivas (bloque)', 5, 384);
end $$;


-- ============================================================
-- Carrera 5: UBA — Ingeniería Civil (FIUBA, Resolución CD 2023-720)
-- Horas reales, mismo tipo de fuente oficial que Ingeniería en Informática
-- de UBA ya cargada. Excluido "Trabajo Profesional de Ingeniería Civil" /
-- "Tesis de Ingeniería Civil" (a elección, actividad final con práctica
-- profesional incluida, mismo criterio que Informática). El catálogo de
-- +60 electivas específicas por área no se pudo desglosar: se cargan los 4
-- casilleros como bloques genéricos por cuatrimestre.
-- ============================================================
insert into carreras (universidad, nombre, nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora)
select 'UBA', 'Ingeniería Civil', 6, 8, true, 1
where not exists (
  select 1 from carreras where universidad = 'UBA' and nombre = 'Ingeniería Civil'
);

do $$
declare
  v_carrera_id uuid;
begin
  select id into v_carrera_id from carreras where universidad = 'UBA' and nombre = 'Ingeniería Civil';

  if v_carrera_id is null then
    raise notice 'No se encontró "Ingeniería Civil" (UBA): no se cargan materias.';
    return;
  end if;

  if exists (select 1 from materias_catalogo where carrera_id = v_carrera_id) then
    raise notice 'UBA Ingeniería Civil ya tiene materias cargadas: no se vuelve a cargar.';
    return;
  end if;

  insert into materias_catalogo (carrera_id, nombre, anio_cursada, horas_catedra) values
    -- Ciclo Básico Común
    (v_carrera_id, 'Introducción al Conocimiento de la Sociedad y el Estado', 1, 64),
    (v_carrera_id, 'Introducción al Pensamiento Científico', 1, 64),
    (v_carrera_id, 'Análisis Matemático A', 1, 144),
    (v_carrera_id, 'Álgebra A', 1, 144),
    (v_carrera_id, 'Física', 1, 96),
    (v_carrera_id, 'Pensamiento Computacional', 1, 96),

    -- 3er cuatrimestre
    (v_carrera_id, 'Análisis Matemático II', 2, 128),
    (v_carrera_id, 'Introducción a la Ingeniería Civil', 2, 64),
    (v_carrera_id, 'Física de los Sistemas de Partículas', 2, 96),

    -- 4to cuatrimestre
    (v_carrera_id, 'Álgebra Lineal', 2, 128),
    (v_carrera_id, 'Química Básica', 2, 96),
    (v_carrera_id, 'Estática', 2, 64),
    (v_carrera_id, 'Introducción al Transporte, la Movilidad y el Urbanismo', 2, 64),

    -- 5to cuatrimestre
    (v_carrera_id, 'Probabilidad y Estadística', 3, 96),
    (v_carrera_id, 'Resistencia de Materiales', 3, 128),
    (v_carrera_id, 'Hidráulica General', 3, 96),
    (v_carrera_id, 'Modelación Numérica', 3, 64),

    -- 6to cuatrimestre
    (v_carrera_id, 'Electricidad y Magnetismo', 3, 96),
    (v_carrera_id, 'Calor y Termodinámica', 3, 32),
    (v_carrera_id, 'Análisis Estructural', 3, 96),
    (v_carrera_id, 'Comportamiento de Materiales', 3, 128),
    (v_carrera_id, 'Hidráulica Aplicada', 3, 64),

    -- 7mo cuatrimestre
    (v_carrera_id, 'Mecánica de Suelos y Geología', 4, 128),
    (v_carrera_id, 'Introducción a la Ciencia de Datos para Ingeniería Civil', 4, 48),
    (v_carrera_id, 'Diseño Geométrico de Obras Lineales', 4, 48),
    (v_carrera_id, 'Construcciones Civiles y Arquitectura', 4, 96),
    (v_carrera_id, 'Topografía y Geodesia', 4, 64),

    -- 8vo cuatrimestre
    (v_carrera_id, 'Economía y Evaluación de Proyectos de Ingeniería Civil', 4, 64),
    (v_carrera_id, 'Materiales Viales y Pavimentos I', 4, 48),
    (v_carrera_id, 'Hidrología Aplicada', 4, 96),
    (v_carrera_id, 'Hormigón I', 4, 128),
    (v_carrera_id, 'Electivas (bloque) — 8vo cuatrimestre', 4, 64),

    -- 9no cuatrimestre
    (v_carrera_id, 'Sistemas de Transporte Guiado I', 5, 48),
    (v_carrera_id, 'Puertos y Vías Navegables I', 5, 48),
    (v_carrera_id, 'Aeropuertos I', 5, 32),
    (v_carrera_id, 'Ingeniería Sanitaria I', 5, 64),
    (v_carrera_id, 'Estructuras Metálicas', 5, 96),
    (v_carrera_id, 'Electivas (bloque) — 9no cuatrimestre', 5, 96),

    -- 10mo cuatrimestre
    (v_carrera_id, 'Instalaciones de las Obras Civiles', 5, 96),
    (v_carrera_id, 'Cimentaciones', 5, 48),
    (v_carrera_id, 'Hormigón II', 5, 64),
    (v_carrera_id, 'Electivas (bloque) — 10mo cuatrimestre', 5, 96),

    -- 11vo cuatrimestre
    (v_carrera_id, 'Legislación y Ejercicio Profesional', 5, 32),
    (v_carrera_id, 'Higiene y Seguridad', 5, 32),
    (v_carrera_id, 'Gestión Socioambiental de las Obras Civiles', 5, 48),
    (v_carrera_id, 'Gerenciamiento y Organización de Obras Civiles', 5, 64),
    (v_carrera_id, 'Electivas (bloque) — 11vo cuatrimestre', 5, 128);
end $$;


-- ============================================================
-- Carrera 6: UADE — Contador Público (Facultad de Ciencias Económicas)
-- Mismo patrón de 68 hs cátedra de esa facultad ya confirmado en las otras
-- 2 carreras — se aplica acá como inferido. Ítems de práctica/seminario
-- sin patrón claro de horas van con horas_catedra NULL. Excluidas Práctica
-- Profesional Jurídico Contable, Práctica Profesional Supervisada
-- (pasantías) y Seminario de Integración Final (materia de cierre,
-- equivalente al Trabajo Integrador Final de las Licenciaturas de UADE).
-- Aviso de vigencia: se cargó el plan según uade.edu.ar, no la versión más
-- vieja que circula en agregadores con otros nombres de materias.
-- ============================================================
insert into carreras (universidad, nombre, nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora)
select 'UADE', 'Contador Público', 6, 8, true, 1
where not exists (
  select 1 from carreras where universidad = 'UADE' and nombre = 'Contador Público'
);

do $$
declare
  v_carrera_id uuid;
begin
  select id into v_carrera_id from carreras where universidad = 'UADE' and nombre = 'Contador Público';

  if v_carrera_id is null then
    raise notice 'No se encontró "Contador Público" (UADE): no se cargan materias.';
    return;
  end if;

  if exists (select 1 from materias_catalogo where carrera_id = v_carrera_id) then
    raise notice 'UADE Contador Público ya tiene materias cargadas: no se vuelve a cargar.';
    return;
  end if;

  insert into materias_catalogo (carrera_id, nombre, anio_cursada, horas_catedra) values
    -- Año 1
    (v_carrera_id, 'Economía', 1, 68),
    (v_carrera_id, 'Matemática Empresarial I', 1, 68),
    (v_carrera_id, 'Administración Empresarial I', 1, 68),
    (v_carrera_id, 'Introducción a la Contabilidad', 1, 68),
    (v_carrera_id, 'Introducción al Derecho', 1, 68),
    (v_carrera_id, 'Historia Económica Mundial', 1, 68),
    (v_carrera_id, 'Marketing', 1, 68),
    (v_carrera_id, 'Introducción al Régimen Impositivo', 1, 68),
    (v_carrera_id, 'Estadística Empresarial I', 1, 68),
    (v_carrera_id, 'Obligaciones y Contratos', 1, 68),

    -- Año 2
    (v_carrera_id, 'Administración Empresarial II', 2, 68),
    (v_carrera_id, 'Modelos Contables y Medición', 2, 68),
    (v_carrera_id, 'Matemática Empresarial II', 2, 68),
    (v_carrera_id, 'Microeconomía', 2, 68),
    (v_carrera_id, 'Optativa (bloque, 1 materia) — 2do año 1C', 2, 68),
    (v_carrera_id, 'Cálculo Financiero', 2, 68),
    (v_carrera_id, 'Estadística Empresarial II', 2, 68),
    (v_carrera_id, 'Sistemas de Costos', 2, 68),
    (v_carrera_id, 'Derecho Societario', 2, 68),
    (v_carrera_id, 'Estados Contables', 2, 68),

    -- Año 3
    (v_carrera_id, 'Contabilidad Gerencial y Control Presupuestario', 3, 68),
    (v_carrera_id, 'Impuestos a la Renta y Patrimonio', 3, 68),
    (v_carrera_id, 'Macroeconomía', 3, 68),
    (v_carrera_id, 'Régimen del Trabajo y la Seguridad Social', 3, 68),
    (v_carrera_id, 'Optativa (bloque, 1 materia) — 3er año 1C', 3, 68),
    (v_carrera_id, 'Títulos Valores y Concursos', 3, 68),
    (v_carrera_id, 'Tópicos Contables Avanzados', 3, 68),
    (v_carrera_id, 'Diseño y Auditoría de Sistemas de Información', 3, 68),
    (v_carrera_id, 'Taller de Práctica de Integración', 3, null),

    -- Año 4
    (v_carrera_id, 'Impuestos a los Consumos y a las Transacciones', 4, 68),
    (v_carrera_id, 'Finanzas Corporativas I', 4, 68),
    (v_carrera_id, 'Seminario de Incumbencias Profesionales', 4, null),
    (v_carrera_id, 'Gestión y Costos', 4, 68),
    (v_carrera_id, 'Auditoría', 4, 68),
    (v_carrera_id, 'Contabilidad Internacional', 4, 68),
    (v_carrera_id, 'Procedimiento Tributario y Auditoría Fiscal', 4, 68),
    (v_carrera_id, 'Gestión de IT', 4, 68);
end $$;


-- ============================================================
-- Carrera 7: UADE — Ingeniería Industrial (Facultad de Ingeniería y
-- Ciencias Exactas)
-- horas_catedra NULL en todas: misma facultad que Ingeniería en Informática
-- de UADE ya cargada con NULL por el mismo motivo (no se confirmó el
-- patrón de 68hs de Ciencias Económicas para esta facultad). Excluidas
-- Examen de Inglés, Práctica Profesional Supervisada y Proyecto Final. La
-- fuente menciona "mínimo 4 optativas" pero solo ubica 3 casilleros por
-- cuatrimestre — se cargan esos 3.
-- ============================================================
insert into carreras (universidad, nombre, nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora)
select 'UADE', 'Ingeniería Industrial', 6, 8, true, 1
where not exists (
  select 1 from carreras where universidad = 'UADE' and nombre = 'Ingeniería Industrial'
);

do $$
declare
  v_carrera_id uuid;
begin
  select id into v_carrera_id from carreras where universidad = 'UADE' and nombre = 'Ingeniería Industrial';

  if v_carrera_id is null then
    raise notice 'No se encontró "Ingeniería Industrial" (UADE): no se cargan materias.';
    return;
  end if;

  if exists (select 1 from materias_catalogo where carrera_id = v_carrera_id) then
    raise notice 'UADE Ingeniería Industrial ya tiene materias cargadas: no se vuelve a cargar.';
    return;
  end if;

  insert into materias_catalogo (carrera_id, nombre, anio_cursada, horas_catedra) values
    -- Año 1
    (v_carrera_id, 'Cálculo I', 1, null),
    (v_carrera_id, 'Química General', 1, null),
    (v_carrera_id, 'Pensamiento Científico', 1, null),
    (v_carrera_id, 'Elementos de Álgebra y Geometría', 1, null),
    (v_carrera_id, 'Introducción a la Programación', 1, null),
    (v_carrera_id, 'Cálculo II', 1, null),
    (v_carrera_id, 'Física General', 1, null),
    (v_carrera_id, 'Álgebra', 1, null),
    (v_carrera_id, 'Probabilidad y Estadística', 1, null),
    (v_carrera_id, 'Administración y Gestión de Organizaciones', 1, null),

    -- Año 2
    (v_carrera_id, 'Cálculo Numérico', 2, null),
    (v_carrera_id, 'Óptica y Calor', 2, null),
    (v_carrera_id, 'Costos y Sistemas Contables', 2, null),
    (v_carrera_id, 'Electricidad y Magnetismo', 2, null),
    (v_carrera_id, 'Estadística y Ciencia de Datos para Toma de Decisiones', 2, null),
    (v_carrera_id, 'Sistemas de Representación Gráfica', 2, null),
    (v_carrera_id, 'Química General e Inorgánica', 2, null),
    (v_carrera_id, 'Electrotecnia', 2, null),
    (v_carrera_id, 'Física del Continuo', 2, null),
    (v_carrera_id, 'Diseño Asistido y Prototipado Industrial', 2, null),
    (v_carrera_id, 'Gestión de Operaciones I', 2, null),

    -- Año 3
    (v_carrera_id, 'Sistemas Empresariales Integrados', 3, null),
    (v_carrera_id, 'Modelado y Simulación de Procesos I', 3, null),
    (v_carrera_id, 'Gestión de Operaciones II', 3, null),
    (v_carrera_id, 'Fundamentos de Economía', 3, null),
    (v_carrera_id, 'Sustentabilidad, Higiene y Seguridad', 3, null),
    (v_carrera_id, 'Modelado y Simulación de Procesos II', 3, null),
    (v_carrera_id, 'Gestión de Operaciones III', 3, null),
    (v_carrera_id, 'Aspectos Éticos y Legales de la Ingeniería', 3, null),
    (v_carrera_id, 'Gestión Emprendedora', 3, null),
    (v_carrera_id, 'Optativa (bloque, 1 materia) — 3er año 2C', 3, null),

    -- Año 4
    (v_carrera_id, 'Gestión de Calidad y Tecnologías de Control', 4, null),
    (v_carrera_id, 'Operaciones Logísticas', 4, null),
    (v_carrera_id, 'Análisis Financiero', 4, null),
    (v_carrera_id, 'Máquinas Eléctricas', 4, null),
    (v_carrera_id, 'Optativa (bloque, 1 materia) — 4to año 1C', 4, null),
    (v_carrera_id, 'Tecnología de los Materiales', 4, null),
    (v_carrera_id, 'Gestión de Calidad, Certificación y Mejora Continua', 4, null),
    (v_carrera_id, 'Termodinámica', 4, null),
    (v_carrera_id, 'Gestión Comercial', 4, null),
    (v_carrera_id, 'Instalaciones Electromecánicas', 4, null),

    -- Año 5
    (v_carrera_id, 'Tecnologías de Procesos Industriales', 5, null),
    (v_carrera_id, 'Mecánica de los Fluidos', 5, null),
    (v_carrera_id, 'Formulación y Evaluación de Proyectos', 5, null),
    (v_carrera_id, 'Tecnología Mecánica y Mecanismos', 5, null),
    (v_carrera_id, 'Diseño de Instalaciones Productivas', 5, null),
    (v_carrera_id, 'Dirección Estratégica y Desarrollo Gerencial', 5, null),
    (v_carrera_id, 'Máquinas Hidráulicas', 5, null),
    (v_carrera_id, 'Máquinas Térmicas', 5, null),
    (v_carrera_id, 'Industria 4.0', 5, null),
    (v_carrera_id, 'Optativa (bloque, 1 materia) — 5to año 2C', 5, null);
end $$;
