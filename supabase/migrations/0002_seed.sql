-- Perfis iniciais
insert into public.profiles (name)
values ('Letícia'), ('Stella')
on conflict (name) do nothing;
