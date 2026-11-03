-- Tablas por usuario de SolarIA. Cada fila pertenece a un usuario (user_id)
-- y la seguridad por fila (RLS) solo deja leer y escribir las propias.
-- user_id toma por defecto el usuario de la sesión, así el cliente no lo envía.

create table public.negocios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nombre text not null check (char_length(nombre) between 1 and 120),
  tipo_negocio text check (char_length(tipo_negocio) <= 80),
  departamento text check (char_length(departamento) <= 80),
  municipio text check (char_length(municipio) <= 80),
  consumo_kwh_mes numeric check (consumo_kwh_mes >= 0),
  valor_recibo numeric check (valor_recibo >= 0),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  -- Un negocio por cuenta en el piloto.
  unique (user_id),
  -- Permite que aparatos exija que el negocio sea del mismo usuario.
  unique (id, user_id)
);

create table public.aparatos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  negocio_id uuid not null,
  nombre text not null check (char_length(nombre) between 1 and 120),
  cantidad integer not null default 1 check (cantidad between 1 and 1000),
  potencia_w numeric check (potencia_w >= 0),
  horas_dia numeric check (horas_dia between 0 and 24),
  creado_en timestamptz not null default now(),
  -- Sin esto, un usuario podría colgar aparatos del negocio de otro.
  foreign key (negocio_id, user_id) references public.negocios (id, user_id) on delete cascade
);

create index aparatos_user_id_idx on public.aparatos (user_id);
create index aparatos_negocio_id_idx on public.aparatos (negocio_id);

create table public.eventos (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  evento text not null check (char_length(evento) between 1 and 64),
  detalle jsonb not null default '{}'::jsonb,
  creado_en timestamptz not null default now()
);

create index eventos_user_id_idx on public.eventos (user_id);

create table public.invitaciones (
  id uuid primary key default gen_random_uuid(),
  -- Quien invita; solo esa cuenta ve la invitación.
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  correo text not null check (correo ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  token uuid not null unique default gen_random_uuid(),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aceptada', 'cancelada')),
  creado_en timestamptz not null default now()
);

create index invitaciones_user_id_idx on public.invitaciones (user_id);

-- Mantiene actualizado_en al día en negocios.
create function public.tocar_actualizado_en() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en := now();
  return new;
end;
$$;

create trigger negocios_actualizado_en
  before update on public.negocios
  for each row execute function public.tocar_actualizado_en();

-- RLS en todas las tablas. Las políticas son solo para "authenticated":
-- el rol anónimo no tiene ninguna, así que no ve ni escribe nada.
-- (select auth.uid()) se evalúa una vez por consulta en vez de por fila.

alter table public.negocios enable row level security;
alter table public.aparatos enable row level security;
alter table public.eventos enable row level security;
alter table public.invitaciones enable row level security;

create policy "negocios: leer los propios" on public.negocios
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "negocios: crear los propios" on public.negocios
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "negocios: editar los propios" on public.negocios
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "negocios: borrar los propios" on public.negocios
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "aparatos: leer los propios" on public.aparatos
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "aparatos: crear los propios" on public.aparatos
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "aparatos: editar los propios" on public.aparatos
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "aparatos: borrar los propios" on public.aparatos
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "eventos: leer los propios" on public.eventos
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "eventos: crear los propios" on public.eventos
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "eventos: editar los propios" on public.eventos
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "eventos: borrar los propios" on public.eventos
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "invitaciones: leer las propias" on public.invitaciones
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "invitaciones: crear las propias" on public.invitaciones
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "invitaciones: editar las propias" on public.invitaciones
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "invitaciones: borrar las propias" on public.invitaciones
  for delete to authenticated using ((select auth.uid()) = user_id);
