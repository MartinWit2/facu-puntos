-- facu_puntos — Fase 2: tablas de premios y canjes (no existían en la base,
-- a pesar de que se creía que sí — confirmado con una consulta a la API
-- antes de escribir este script). Corré esto completo en el SQL Editor.

-- ============================================================
-- premios
-- El catálogo de premios de CADA usuario (no es compartido como
-- materias_catalogo). Repetibles: canjear uno no lo borra ni lo bloquea.
-- ============================================================
create table if not exists premios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nombre text not null,
  categoria text not null,
  costo_puntos numeric not null,
  created_at timestamptz not null default now()
);

alter table premios enable row level security;

create policy "premios_select_own"
  on premios
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "premios_insert_own"
  on premios
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "premios_update_own"
  on premios
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "premios_delete_own"
  on premios
  for delete
  to authenticated
  using (auth.uid() = user_id);


-- ============================================================
-- canjes
-- Historial de canjes. Guarda una "foto" del nombre y costo del premio en
-- ese momento: si el premio se edita o se borra después, el canje ya hecho
-- no cambia. premio_id queda en null si el premio original se borra (no se
-- borra el canje), pero el nombre/costo ya quedaron guardados en la fila.
-- No hay policy de update/delete: un canje es un registro histórico, no se
-- edita ni se borra desde la app.
-- ============================================================
create table if not exists canjes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  premio_id uuid references premios (id) on delete set null,
  premio_nombre text not null,
  costo_puntos numeric not null,
  fecha timestamptz not null default now()
);

alter table canjes enable row level security;

create policy "canjes_select_own"
  on canjes
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "canjes_insert_own"
  on canjes
  for insert
  to authenticated
  with check (auth.uid() = user_id);
