-- Unipoints (facu_puntos) — corrige "Borrar historial" (agregado en 0014):
-- borrar canjes de verdad hacía que calcularSaldoDisponible dejara de
-- restarlos, "devolviendo" puntos ya gastados. Eso no tiene que pasar:
-- borrar el historial es una limpieza visual, no una devolución de puntos.
-- En vez de eliminar filas, se marcan `oculto = true`: siguen existiendo
-- (y sumando al gasto total) pero las pantallas de historial las filtran.
-- La policy de delete de 0014 queda sin uso pero no hace falta revertirla.
-- Corré este script completo en el SQL Editor de Supabase.

alter table canjes add column if not exists oculto boolean not null default false;

create policy "canjes_update_own"
  on canjes
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
