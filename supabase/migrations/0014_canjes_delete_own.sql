-- Unipoints (facu_puntos) — permite borrar el historial de canjes. La
-- migración original (0004) dejó `canjes` a propósito sin policy de delete
-- ("un canje es un registro histórico, no se edita ni se borra desde la
-- app"), pero ahora la app suma un botón "Borrar historial" en Premios.
-- Sin esta policy, el DELETE de la app no falla con error (RLS lo deja
-- pasar como si borrara 0 filas), pero tampoco borra nada de verdad.
-- Corré este script completo en el SQL Editor de Supabase.

create policy "canjes_delete_own"
  on canjes
  for delete
  to authenticated
  using (auth.uid() = user_id);
