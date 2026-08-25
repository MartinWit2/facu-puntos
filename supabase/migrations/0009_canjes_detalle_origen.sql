-- facu_puntos — permite elegir de qué materia(s) salen los puntos al
-- canjear un premio. Guarda esa elección como una "foto" en el propio
-- canje (igual criterio que premio_nombre/costo_puntos): un array de
-- { materiaId, materiaNombre, puntos }, en el orden en que el usuario
-- tildó las materias como origen.
-- Los canjes ya hechos antes de este cambio quedan con detalle_origen en
-- null (no se puede reconstruir su origen real) y no se tocan ni se
-- recalculan — el saldo total sigue calculándose igual que siempre.
-- Corré este script completo en el SQL Editor de Supabase.

alter table canjes add column if not exists detalle_origen jsonb;
