-- facu_puntos — Fase 2, paso 1: esquema base multi-carrera.
-- Corré este script completo en el SQL Editor de Supabase (Project → SQL Editor → New query).
-- No existía ninguna tabla previa de la app en la base: este script las crea todas de cero.

-- ============================================================
-- carreras
-- Cada carrera define sus propios valores por default para las reglas de
-- evaluación y el sistema de puntos. Estos son los defaults de la carrera,
-- no valores globales de la app — cada materia puede pisarlos puntualmente
-- (ver columnas *_override en user_materias).
-- ============================================================
create table if not exists carreras (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  nota_aprobacion numeric not null default 6,
  nota_promocion numeric not null default 8,
  permite_promocion boolean not null default true,
  puntos_por_hora numeric not null default 1,
  created_at timestamptz not null default now()
);

alter table carreras enable row level security;

-- Catálogo compartido, sin datos de usuario: cualquier usuario logueado lo
-- puede leer. No hay policy de escritura para usuarios comunes; cargar o
-- editar carreras se hace a mano desde el SQL Editor / dashboard.
create policy "carreras_select_authenticated"
  on carreras
  for select
  to authenticated
  using (true);

insert into carreras (nombre, nota_aprobacion, nota_promocion, permite_promocion, puntos_por_hora)
values ('UTN', 6, 8, true, 1);


-- ============================================================
-- perfiles
-- Un perfil por usuario. Dice a qué carrera pertenece (o null si todavía no
-- la eligió). La UI para elegir carrera se arma en el próximo paso; por
-- ahora solo dejamos la tabla lista.
-- ============================================================
create table if not exists perfiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  carrera_id uuid references carreras (id),
  created_at timestamptz not null default now()
);

alter table perfiles enable row level security;

create policy "perfiles_select_own"
  on perfiles
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "perfiles_insert_own"
  on perfiles
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "perfiles_update_own"
  on perfiles
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ============================================================
-- materias_catalogo
-- El "plan de estudio" de referencia por carrera, compartido entre todos
-- los usuarios de esa carrera. El usuario clona una fila de acá hacia su
-- propia user_materias para empezar a cursarla.
-- horas_catedra permite NULL: hay carreras (ej. UADE) donde no tenemos ese
-- dato en el catálogo; el usuario lo completa él mismo al clonar.
-- ============================================================
create table if not exists materias_catalogo (
  id uuid primary key default gen_random_uuid(),
  carrera_id uuid not null references carreras (id) on delete cascade,
  nombre text not null,
  anio_cursada integer not null,
  horas_catedra numeric,
  cantidad_parciales integer not null default 2,
  cantidad_recuperatorios integer not null default 2,
  cantidad_instancias_final integer not null default 4,
  created_at timestamptz not null default now()
);

alter table materias_catalogo enable row level security;

create policy "materias_catalogo_select_authenticated"
  on materias_catalogo
  for select
  to authenticated
  using (true);


-- ============================================================
-- user_materias
-- La instancia personal de una materia para un usuario: su propia copia de
-- la configuración (por si la ajusta) más todo el estado de cursada
-- (notas de parciales, final, tick manual, nota manual). Cada usuario solo
-- ve y edita sus propias filas.
--
-- pool_override: pisa a mano el pool de puntos de ESTA materia puntual.
-- nota_aprobacion_override / nota_promocion_override / permite_promocion_override:
--   si son NULL, se usa el valor de la carrera del usuario (vía perfiles →
--   carreras). Si tienen un valor, ese pisa al de la carrera para esta
--   materia puntual — mismo criterio que pool_override.
-- ============================================================
create table if not exists user_materias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  materia_catalogo_id uuid references materias_catalogo (id),
  nombre text not null,
  anio_cursada integer not null,
  horas_catedra numeric,
  cantidad_parciales integer not null default 2,
  cantidad_recuperatorios integer not null default 2,
  cantidad_instancias_final integer not null default 4,
  parciales jsonb not null default '[]'::jsonb,
  final jsonb not null default '{"notas": []}'::jsonb,
  tick_manual text check (tick_manual in ('promocion', 'firma')),
  nota_materia_manual numeric,
  pool_override numeric,
  nota_aprobacion_override numeric,
  nota_promocion_override numeric,
  permite_promocion_override boolean,
  created_at timestamptz not null default now()
);

alter table user_materias enable row level security;

create policy "user_materias_select_own"
  on user_materias
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "user_materias_insert_own"
  on user_materias
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "user_materias_update_own"
  on user_materias
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_materias_delete_own"
  on user_materias
  for delete
  to authenticated
  using (auth.uid() = user_id);
