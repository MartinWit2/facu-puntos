-- facu_puntos — distingue "Pendiente" de "Cursando": el clonado del plan de
-- estudio dejaba las materias en "Cursando" (bug), cuando en realidad tienen
-- que arrancar en "Pendiente" hasta que el usuario marque a mano que empezó
-- a cursarlas. Corré este script completo en el SQL Editor de Supabase.

-- 1) Columna nueva: false por default, así toda materia nueva (clonada o
-- cargada a mano) arranca en Pendiente sin tocar el código de clonado.
alter table user_materias add column if not exists empezada boolean not null default false;

-- 2) Corrige los datos que ya están mal por el bug: cualquier materia que
-- YA tenga alguna nota cargada (parcial o final) se marca como empezada,
-- para no "resetear" a Pendiente un progreso real ya cargado. Las que no
-- tienen ninguna nota se quedan en el default (false = Pendiente), que es
-- exactamente la corrección que hace falta para esos casos.
update user_materias
set empezada = true
where empezada = false
  and (
    exists (
      select 1
      from jsonb_array_elements(parciales) as parcial,
           jsonb_array_elements(parcial -> 'notas') as nota
      where nota <> 'null'::jsonb
    )
    or exists (
      select 1
      from jsonb_array_elements(final -> 'notas') as nota
      where nota <> 'null'::jsonb
    )
  );
