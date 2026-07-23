-- Bucket público para as fotos dos looks
insert into storage.buckets (id, name, public)
values ('looks', 'looks', true)
on conflict (id) do nothing;

-- Policies do bucket (mesma lógica do arquivo anterior: sem login, liberado
-- para a chave anônima, já que só Letícia e Stella têm o link do app).
drop policy if exists "looks_bucket_read" on storage.objects;
create policy "looks_bucket_read" on storage.objects
  for select using (bucket_id = 'looks');

drop policy if exists "looks_bucket_insert" on storage.objects;
create policy "looks_bucket_insert" on storage.objects
  for insert with check (bucket_id = 'looks');

drop policy if exists "looks_bucket_update" on storage.objects;
create policy "looks_bucket_update" on storage.objects
  for update using (bucket_id = 'looks') with check (bucket_id = 'looks');

drop policy if exists "looks_bucket_delete" on storage.objects;
create policy "looks_bucket_delete" on storage.objects
  for delete using (bucket_id = 'looks');
