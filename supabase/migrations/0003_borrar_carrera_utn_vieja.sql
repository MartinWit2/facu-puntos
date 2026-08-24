-- facu_puntos — Fase 2: limpieza de la fila vieja "UTN" en carreras (era el
-- seed original, cargada con el nombre de la universidad en vez del nombre
-- de la carrera; quedó reemplazada por "Ingeniería en Sistemas de Información").
-- Corré este script completo en el SQL Editor de Supabase.

-- 1) Reasigna cualquier perfil que todavía apunte a la carrera vieja hacia
-- la carrera correcta, para no dejar ninguna fila de perfiles "colgada".
update perfiles
set carrera_id = (select id from carreras where nombre = 'Ingeniería en Sistemas de Información')
where carrera_id = (select id from carreras where nombre = 'UTN');

-- 2) Ahora sí, borra la fila vieja.
delete from carreras where nombre = 'UTN';
