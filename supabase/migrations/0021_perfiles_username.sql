-- facu_puntos — prompt-32, sección 3: nombre de usuario opcional para
-- loguearse (además de email) y para mostrar en vez del email pelado.
-- Corré este script completo en el SQL Editor de Supabase.

-- Permite null: las cuentas ya existentes no tienen uno cargado y no hace
-- falta forzarlas a completarlo — siguen pudiendo loguearse con email.
alter table perfiles add column if not exists username text;

-- Único, sin importar mayúsculas/minúsculas (índice sobre lower(username),
-- no sobre la columna tal cual) — así "Juan123" y "juan123" no pueden
-- coexistir. Postgres no choca dos NULLs entre sí en un índice único, así
-- que las cuentas sin username (la mayoría, por ahora) conviven sin problema.
create unique index if not exists perfiles_username_lower_idx on perfiles (lower(username));
