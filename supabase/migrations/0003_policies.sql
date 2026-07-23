-- Row Level Security
--
-- Este app não usa Supabase Auth (não há tela de login): a pessoa apenas
-- escolhe "Letícia" ou "Stella" no navegador, e isso fica salvo no
-- localStorage do aparelho. Por isso as policies abaixo liberam leitura e
-- escrita para a chave anônima (anon) em todas as tabelas — é isso que
-- permite as duas usarem o app pelo link, sem cadastro.
--
-- Se no futuro vocês quiserem restringir de verdade (por exemplo, impedir
-- que a Letícia edite/exclua um look criado pela Stella), a forma correta é
-- adicionar Supabase Auth (magic link/e-mail) e trocar `using (true)` por
-- regras baseadas em `auth.uid()`.

alter table public.profiles    enable row level security;
alter table public.looks       enable row level security;
alter table public.look_images enable row level security;
alter table public.products    enable row level security;
alter table public.votes       enable row level security;
alter table public.comments    enable row level security;
alter table public.favorites   enable row level security;

-- PROFILES (somente leitura pelo app)
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select using (true);

-- LOOKS
drop policy if exists "looks_select" on public.looks;
create policy "looks_select" on public.looks for select using (true);
drop policy if exists "looks_insert" on public.looks;
create policy "looks_insert" on public.looks for insert with check (true);
drop policy if exists "looks_update" on public.looks;
create policy "looks_update" on public.looks for update using (true) with check (true);
drop policy if exists "looks_delete" on public.looks;
create policy "looks_delete" on public.looks for delete using (true);

-- LOOK_IMAGES
drop policy if exists "look_images_select" on public.look_images;
create policy "look_images_select" on public.look_images for select using (true);
drop policy if exists "look_images_insert" on public.look_images;
create policy "look_images_insert" on public.look_images for insert with check (true);
drop policy if exists "look_images_update" on public.look_images;
create policy "look_images_update" on public.look_images for update using (true) with check (true);
drop policy if exists "look_images_delete" on public.look_images;
create policy "look_images_delete" on public.look_images for delete using (true);

-- PRODUCTS
drop policy if exists "products_select" on public.products;
create policy "products_select" on public.products for select using (true);
drop policy if exists "products_insert" on public.products;
create policy "products_insert" on public.products for insert with check (true);
drop policy if exists "products_update" on public.products;
create policy "products_update" on public.products for update using (true) with check (true);
drop policy if exists "products_delete" on public.products;
create policy "products_delete" on public.products for delete using (true);

-- VOTES
drop policy if exists "votes_select" on public.votes;
create policy "votes_select" on public.votes for select using (true);
drop policy if exists "votes_insert" on public.votes;
create policy "votes_insert" on public.votes for insert with check (true);
drop policy if exists "votes_update" on public.votes;
create policy "votes_update" on public.votes for update using (true) with check (true);
drop policy if exists "votes_delete" on public.votes;
create policy "votes_delete" on public.votes for delete using (true);

-- COMMENTS
drop policy if exists "comments_select" on public.comments;
create policy "comments_select" on public.comments for select using (true);
drop policy if exists "comments_insert" on public.comments;
create policy "comments_insert" on public.comments for insert with check (true);
drop policy if exists "comments_delete" on public.comments;
create policy "comments_delete" on public.comments for delete using (true);

-- FAVORITES
drop policy if exists "favorites_select" on public.favorites;
create policy "favorites_select" on public.favorites for select using (true);
drop policy if exists "favorites_insert" on public.favorites;
create policy "favorites_insert" on public.favorites for insert with check (true);
drop policy if exists "favorites_delete" on public.favorites;
create policy "favorites_delete" on public.favorites for delete using (true);
