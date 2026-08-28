-- Unipoints (facu_puntos) — permite empezar (o cambiar) sin una carrera fija,
-- para el caso de alguien cuya carrera todavía no está en `carreras`. En vez
-- de sacar las reglas de evaluación/puntos de una fila de `carreras`, el
-- usuario las carga a mano una sola vez y quedan guardadas en su perfil.
-- Mismo criterio de "las cuatro juntas o ninguna" que ya tienen las columnas
-- *_override de user_materias: se completan las cuatro o ninguna.
-- `carrera_id` ya era nullable desde la migración inicial, no hace falta
-- tocarlo. No hacen falta policies nuevas: perfiles_select_own/update_own ya
-- cubren cualquier columna de la fila propia del usuario.
-- Corré este script completo en el SQL Editor de Supabase.

alter table perfiles add column if not exists nota_aprobacion_custom numeric;
alter table perfiles add column if not exists nota_promocion_custom numeric;
alter table perfiles add column if not exists permite_promocion_custom boolean;
alter table perfiles add column if not exists puntos_por_hora_custom numeric;
