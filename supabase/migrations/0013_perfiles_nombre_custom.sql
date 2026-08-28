-- Unipoints (facu_puntos) — la carrera "sin catálogo fijo" (ver migración
-- 0012) necesita un nombre propio: en vez de mostrar el término genérico
-- "sin carrera fija" en toda la app, el usuario le pone el nombre que
-- quiera al elegirla (o cambiar a ella), y ese nombre se muestra siempre
-- que se muestre el nombre de la carrera actual.
-- Corré este script completo en el SQL Editor de Supabase.

alter table perfiles add column if not exists nombre_custom text;
