-- Arirang Looks — schema inicial
-- Rode este arquivo no SQL Editor do Supabase (ou via supabase db push)

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------------
create table if not exists public.profiles (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique
);

-- ---------------------------------------------------------------
-- LOOKS
-- ---------------------------------------------------------------
create table if not exists public.looks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  artist      text,
  event       text,
  category    text,
  notes       text,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists looks_artist_idx     on public.looks (artist);
create index if not exists looks_event_idx      on public.looks (event);
create index if not exists looks_category_idx   on public.looks (category);
create index if not exists looks_created_by_idx on public.looks (created_by);
create index if not exists looks_created_at_idx on public.looks (created_at desc);

-- mantém updated_at em dia automaticamente
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists looks_set_updated_at on public.looks;
create trigger looks_set_updated_at
before update on public.looks
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------
-- LOOK IMAGES (várias fotos por look, com ordem)
-- ---------------------------------------------------------------
create table if not exists public.look_images (
  id          uuid primary key default gen_random_uuid(),
  look_id     uuid not null references public.looks(id) on delete cascade,
  image_url   text not null,
  order_index integer not null default 0
);

create index if not exists look_images_look_id_idx on public.look_images (look_id, order_index);

-- ---------------------------------------------------------------
-- PRODUCTS (vários produtos por look)
-- ---------------------------------------------------------------
create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  look_id      uuid not null references public.looks(id) on delete cascade,
  product_name text not null,
  brand        text,
  price        numeric(10,2),
  url          text
);

create index if not exists products_look_id_idx on public.products (look_id);

-- ---------------------------------------------------------------
-- VOTES (nota de 1 a 10, uma por pessoa por look)
-- ---------------------------------------------------------------
create table if not exists public.votes (
  id         uuid primary key default gen_random_uuid(),
  look_id    uuid not null references public.looks(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  rating     smallint not null check (rating between 1 and 10),
  created_at timestamptz not null default now(),
  unique (look_id, profile_id)
);

create index if not exists votes_look_id_idx on public.votes (look_id);

-- ---------------------------------------------------------------
-- COMMENTS
-- ---------------------------------------------------------------
create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  look_id    uuid not null references public.looks(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  comment    text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_look_id_idx on public.comments (look_id, created_at);

-- ---------------------------------------------------------------
-- FAVORITES
-- ---------------------------------------------------------------
create table if not exists public.favorites (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  look_id    uuid not null references public.looks(id) on delete cascade,
  unique (profile_id, look_id)
);

create index if not exists favorites_look_id_idx on public.favorites (look_id);
