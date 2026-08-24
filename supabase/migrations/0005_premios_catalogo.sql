-- facu_puntos — Fase 2: catálogo de premios de ejemplo (a nivel app, no por
-- usuario ni por carrera). Se clona a la tabla `premios` de cada usuario la
-- primera vez que elige carrera, igual que el catálogo de materias.
-- Corré este script completo en el SQL Editor de Supabase.

create table if not exists premios_catalogo (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  categoria text not null,
  costo_puntos numeric not null,
  created_at timestamptz not null default now()
);

alter table premios_catalogo enable row level security;

-- Catálogo compartido, de solo lectura desde el cliente (igual que carreras
-- y materias_catalogo): cualquier usuario logueado lo puede leer, pero no
-- hay policy de insert/update/delete — se carga a mano desde acá.
create policy "premios_catalogo_select_authenticated"
  on premios_catalogo
  for select
  to authenticated
  using (true);

-- Los mismos 5-6 premios de ejemplo que ya se usaban como default en la
-- Fase 1 (localStorage), sin inventar una lista nueva.
insert into premios_catalogo (nombre, categoria, costo_puntos) values
  ('Salir a comer afuera', 'Comida', 80),
  ('Pedir delivery de algo rico', 'Comida', 40),
  ('Maratón de una serie', 'Ocio', 60),
  ('Noche de juegos o salida con amigos', 'Ocio', 90),
  ('Comprarme algo que quiero hace tiempo', 'Compras', 150),
  ('Día libre sin culpa', 'Descanso', 100);
