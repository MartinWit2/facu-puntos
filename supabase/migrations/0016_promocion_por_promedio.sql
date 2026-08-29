-- Unipoints (facu_puntos) — algunas carreras (ej. UBA) promocionan una
-- materia si el PROMEDIO de las notas de los parciales llega a la nota de
-- promoción, en vez de exigir que cada parcial individualmente la alcance
-- (que es como funciona hoy, y sigue siendo el default). Cada parcial
-- individual sigue necesitando aprobar (con recuperatorio si hace falta)
-- exactamente igual que hoy — lo único que cambia es cómo se decide
-- promoción vs. firma una vez que todos los parciales están aprobados.
-- Mismo patrón que ya existe para permite_promocion: default por carrera,
-- con la opción de pisarlo por materia puntual o, para quien arma su
-- propia carrera, cargarlo a mano.
-- Corré este script completo en el SQL Editor de Supabase.

alter table carreras add column if not exists promocion_por_promedio boolean not null default false;
alter table user_materias add column if not exists promocion_por_promedio_override boolean;
alter table perfiles add column if not exists promocion_por_promedio_custom boolean;

update carreras set promocion_por_promedio = true
where universidad = 'UBA' and nombre = 'Licenciatura en Relaciones del Trabajo';
