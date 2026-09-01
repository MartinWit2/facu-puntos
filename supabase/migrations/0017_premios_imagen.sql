-- facu_puntos — Rediseño mobile: imagen opcional por premio (sección "4b"
-- del handoff). Columna nullable + bucket de Storage propio, mismo
-- criterio de RLS que el resto de la app (acceso solo al propio user_id,
-- acá vía el primer segmento del path del archivo).

alter table premios add column if not exists imagen_url text;

insert into storage.buckets (id, name, public)
values ('premios-imagenes', 'premios-imagenes', true)
on conflict (id) do nothing;

create policy "premios_imagenes_select_own"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'premios-imagenes' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "premios_imagenes_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'premios-imagenes' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "premios_imagenes_update_own"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'premios-imagenes' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'premios-imagenes' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "premios_imagenes_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'premios-imagenes' and (storage.foldername(name))[1] = auth.uid()::text);
