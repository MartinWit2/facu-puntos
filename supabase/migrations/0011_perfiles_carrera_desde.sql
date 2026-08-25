-- Unipoints (facu_puntos) — arregla que el saldo de puntos quedara negativo
-- después de cambiar de carrera: los canjes hechos en la carrera anterior no
-- tienen que descontarse del saldo de la carrera nueva. El saldo arranca en
-- 0 con cada cambio de carrera; el comportamiento de saldo negativo por
-- recursar una materia sigue exactamente igual que antes, esto no lo toca.
-- Corré este script completo en el SQL Editor de Supabase.

-- Columna nueva: desde cuándo rige la carrera actual del usuario. Para las
-- filas existentes se completa con `created_at` (la fecha en que eligieron
-- su carrera por primera vez), ya que "cambiar de carrera" recién se agrega
-- ahora y ningún usuario real cambió de carrera todavía.
alter table perfiles add column if not exists carrera_desde timestamptz;
update perfiles set carrera_desde = created_at where carrera_desde is null;
alter table perfiles alter column carrera_desde set not null;
alter table perfiles alter column carrera_desde set default now();
