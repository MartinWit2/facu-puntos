-- facu_puntos — Rediseño mobile: foto opcional al confirmar un canje
-- (sección "4c" del handoff). Mismo criterio que 0017: columna nullable +
-- bucket propio con RLS por carpeta de user_id.

alter table canjes add column if not exists foto_url text;

insert into storage.buckets (id, name, public)
values ('canjes-fotos', 'canjes-fotos', true)
on conflict (id) do nothing;

create policy "canjes_fotos_select_own"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'canjes-fotos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "canjes_fotos_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'canjes-fotos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "canjes_fotos_update_own"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'canjes-fotos' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'canjes-fotos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "canjes_fotos_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'canjes-fotos' and (storage.foldername(name))[1] = auth.uid()::text);
