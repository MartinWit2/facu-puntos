-- facu_puntos — Notificaciones push (sección "4.1"/"4.4" del prompt de
-- notificaciones). Dos tablas nuevas:
--
-- push_subscriptions: una fila por dispositivo/navegador suscripto. El
-- alta/baja la hace el frontend directo con el cliente del usuario
-- logueado, por eso tiene RLS normal (mismo criterio que el resto de las
-- tablas de usuario: solo el propio user_id).
--
-- notificaciones_enviadas: registro interno del proceso de servidor
-- (Edge Function con service_role) para no repetir avisos ni perder el
-- hilo de los recordatorios de "nota pendiente" que se repiten cada N
-- días. El frontend nunca la lee ni la escribe — RLS denegado por
-- default para anon/authenticated, sin ninguna policy que les dé acceso
-- (service_role bypassea RLS igual, no necesita policy propia).

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth_key text not null,
  creado_en timestamptz not null default now()
);

alter table push_subscriptions enable row level security;

create policy "push_subscriptions_select_own"
  on push_subscriptions
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "push_subscriptions_insert_own"
  on push_subscriptions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "push_subscriptions_delete_own"
  on push_subscriptions
  for delete
  to authenticated
  using (auth.uid() = user_id);


create table if not exists notificaciones_enviadas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  materia_id uuid not null references user_materias (id) on delete cascade,
  tipo text not null check (tipo in ('parcial_proximo', 'final_proximo', 'nota_pendiente')),
  clave_instancia text not null,
  ultima_fecha_referencia date not null,
  proximo_envio_en date,
  enviado_en timestamptz not null default now(),
  unique (user_id, materia_id, tipo, clave_instancia)
);

alter table notificaciones_enviadas enable row level security;
-- Sin policies a propósito: RLS habilitado + ninguna policy = denegado
-- por default para anon/authenticated. Solo service_role (que bypassea
-- RLS) la toca, desde la Edge Function.
