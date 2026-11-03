-- "Quiero que me contacten": copia en Supabase de las solicitudes que también
-- van a la hoja de Google. Correr después de 20261104000000_growth_loop_invitaciones.sql.

create table public.solicitudes_contacto (
  id uuid primary key default gen_random_uuid(),
  creado_en timestamptz not null default now(),
  -- Si pidió el contacto con sesión iniciada; la calculadora se usa sin cuenta.
  user_id uuid references auth.users (id) on delete set null,
  session_id text check (char_length(session_id) <= 64),
  -- Referencia SIA-XXXXXX, la misma del mensaje de WhatsApp.
  ref text check (char_length(ref) <= 20),
  proveedor text check (char_length(proveedor) <= 80),
  plan text check (char_length(plan) <= 60),
  oferta text check (char_length(oferta) <= 20),
  nombre text not null check (char_length(nombre) between 2 and 100),
  -- Celular colombiano normalizado: 10 dígitos que empiezan por 3.
  celular text not null check (celular ~ '^3[0-9]{9}$'),
  municipio text check (char_length(municipio) <= 100),
  -- Autorizó que SolarIA lo contacte (obligatorio) y, aparte, compartir con el proveedor.
  consentimiento boolean not null check (consentimiento),
  compartir_con_proveedor boolean not null default false,
  negocio jsonb not null default '{}'::jsonb,
  estimado jsonb not null default '{}'::jsonb,
  estado text not null default 'nueva' check (estado in ('nueva', 'contactada', 'descartada'))
);

create index solicitudes_contacto_creado_idx on public.solicitudes_contacto (creado_en desc);

-- RLS sin políticas y sin permisos: nadie lee ni escribe desde un cliente.
-- Se crean solo con crear_solicitud_contacto; el equipo las ve en el panel.
alter table public.solicitudes_contacto enable row level security;
revoke all on public.solicitudes_contacto from anon, authenticated;

-- Valida e inserta. La puede llamar un visitante sin sesión (la calculadora
-- no pide cuenta). user_id sale de auth.uid(), nunca de un parámetro.
create function public.crear_solicitud_contacto(p jsonb) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if coalesce((p ->> 'consentimiento')::boolean, false) is not true then
    raise exception 'Falta la autorización de contacto';
  end if;

  insert into public.solicitudes_contacto (
    user_id, session_id, ref, proveedor, plan, oferta, nombre, celular, municipio,
    consentimiento, compartir_con_proveedor, negocio, estimado
  ) values (
    auth.uid(),
    left(p ->> 'session_id', 64),
    left(p ->> 'ref', 20),
    left(p ->> 'proveedor', 80),
    left(p ->> 'plan', 60),
    left(p ->> 'oferta', 20),
    trim(p ->> 'nombre'),
    p ->> 'celular',
    left(p ->> 'municipio', 100),
    true,
    coalesce((p ->> 'compartir_con_proveedor')::boolean, false),
    case when jsonb_typeof(p -> 'negocio') = 'object' then p -> 'negocio' else '{}'::jsonb end,
    case when jsonb_typeof(p -> 'estimado') = 'object' then p -> 'estimado' else '{}'::jsonb end
  )
  returning id into v_id;
  return v_id;
end;
$$;

revoke execute on function public.crear_solicitud_contacto(jsonb) from public, anon, authenticated;
grant execute on function public.crear_solicitud_contacto(jsonb) to anon, authenticated;
