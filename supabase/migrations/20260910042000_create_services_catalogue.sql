-- Services catalogue backing the /newbooking experience.

create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  service_type text not null,
  audience text not null check (audience in ('business', 'consumer')),
  short_description text not null,
  long_description text,
  hero_image_key text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.service_pricing (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services (id) on delete cascade,
  package_name text not null,
  includes text,
  price_from numeric(10, 2),
  currency text not null default 'MYR',
  unit text,
  sort_order integer not null default 0
);

create table public.service_gallery (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services (id) on delete cascade,
  image_key text not null,
  caption text,
  sort_order integer not null default 0
);

create index services_is_active_sort_order_idx on public.services (is_active, sort_order);
create index service_pricing_service_id_idx on public.service_pricing (service_id);
create index service_gallery_service_id_idx on public.service_gallery (service_id);

-- Reuses existing public.update_updated_at()
create trigger services_updated_at
  before update on public.services
  for each row execute function public.update_updated_at();

alter table public.services enable row level security;
alter table public.service_pricing enable row level security;
alter table public.service_gallery enable row level security;

-- Project default privileges grant ALL on new public tables.
revoke all on table public.services from anon, authenticated;
revoke all on table public.service_pricing from anon, authenticated;
revoke all on table public.service_gallery from anon, authenticated;

grant select on table public.services to anon, authenticated;
grant select on table public.service_pricing to anon, authenticated;
grant select on table public.service_gallery to anon, authenticated;

grant select, insert, update, delete on table public.services to service_role;
grant select, insert, update, delete on table public.service_pricing to service_role;
grant select, insert, update, delete on table public.service_gallery to service_role;

create policy "Public can read active services"
  on public.services
  for select
  to anon, authenticated
  using (is_active = true);

create policy "Public can read pricing of active services"
  on public.service_pricing
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.services s
      where s.id = service_pricing.service_id
        and s.is_active = true
    )
  );

create policy "Public can read gallery of active services"
  on public.service_gallery
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.services s
      where s.id = service_gallery.service_id
        and s.is_active = true
    )
  );
