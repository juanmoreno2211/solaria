-- Growth loop: enlace único de invitación, aperturas sin sesión y atribución
-- del registro. Correr después de 20261103000000_mi_negocio_recibos.sql.

-- Invitaciones por enlace: ya no hace falta el correo del socio.
alter table public.invitaciones alter column correo drop not null;

-- Código corto del enlace /i/[codigo]: 10 caracteres de un alfabeto de 32
-- (sin i, l, o ni 1), unos 50 bits de azar. Lo genera la app.
alter table public.invitaciones
  add column codigo text unique check (codigo ~ '^[a-hjkmnp-z02-9]{10}$');

-- Un enlace por dueño.
create unique index invitaciones_un_enlace_por_usuario on public.invitaciones (user_id) where codigo is not null;

-- El código no cambia una vez creado: las aperturas y registros cuelgan de él.
create function public.invitaciones_codigo_fijo() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.codigo is not null and new.codigo is distinct from old.codigo then
    raise exception 'El código de una invitación no se puede cambiar';
  end if;
  return new;
end;
$$;

create trigger invitaciones_codigo_fijo
  before update on public.invitaciones
  for each row execute function public.invitaciones_codigo_fijo();

-- invitacion_abierta se registra sin sesión: user_id queda nulo. Las políticas
-- de eventos exigen auth.uid() = user_id, así que nadie lee ni inserta esas
-- filas desde un cliente; solo la función registrar_apertura.
alter table public.eventos alter column user_id drop not null;

-- Una fila por navegador (cookie de visitante) y por invitación.
create table public.aperturas (
  id bigint generated always as identity primary key,
  invitacion_id uuid not null references public.invitaciones (id) on delete cascade,
  visitante text not null check (char_length(visitante) between 16 and 64),
  creado_en timestamptz not null default now(),
  unique (invitacion_id, visitante)
);

create index aperturas_invitacion_idx on public.aperturas (invitacion_id);

-- RLS sin políticas y sin permisos: solo se escribe con registrar_apertura y
-- el dueño solo ve el total con resumen_mis_invitaciones.
alter table public.aperturas enable row level security;
revoke all on public.aperturas from anon, authenticated;

-- Qué cuenta llegó por qué invitación. Una sola por cuenta, para siempre.
create table public.atribuciones (
  id bigint generated always as identity primary key,
  invitacion_id uuid not null references public.invitaciones (id) on delete cascade,
  invitado_id uuid not null unique references auth.users (id) on delete cascade,
  creado_en timestamptz not null default now()
);

create index atribuciones_invitacion_idx on public.atribuciones (invitacion_id);

-- El invitado puede ver su propia fila; nadie la crea, cambia ni borra desde
-- un cliente (solo atribuir_invitacion).
alter table public.atribuciones enable row level security;
revoke all on public.atribuciones from anon, authenticated;
grant select on public.atribuciones to authenticated;

create policy "atribuciones: el invitado ve la suya" on public.atribuciones
  for select to authenticated using ((select auth.uid()) = invitado_id);

-- ¿Existe el enlace? Para la página del invitado, sin revelar nada del dueño.
create function public.invitacion_valida(p_codigo text) returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.invitaciones where codigo = p_codigo and estado <> 'cancelada'
  );
$$;

-- Cuenta una apertura por navegador. No cuenta las del dueño con su sesión.
-- Devuelve 'contada', 'repetida', 'propia', 'no_existe' o 'invalida'.
create function public.registrar_apertura(p_codigo text, p_visitante text) returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_invitacion public.invitaciones%rowtype;
  v_filas integer;
begin
  if p_visitante is null or char_length(p_visitante) not between 16 and 64 then
    return 'invalida';
  end if;

  select * into v_invitacion from public.invitaciones
  where codigo = p_codigo and estado <> 'cancelada';
  if not found then
    return 'no_existe';
  end if;

  if v_invitacion.user_id = auth.uid() then
    return 'propia';
  end if;

  insert into public.aperturas (invitacion_id, visitante)
  values (v_invitacion.id, p_visitante)
  on conflict (invitacion_id, visitante) do nothing;
  get diagnostics v_filas = row_count;
  if v_filas = 0 then
    return 'repetida';
  end if;

  insert into public.eventos (user_id, evento, detalle)
  values (null, 'invitacion_abierta', jsonb_build_object('codigo', p_codigo));
  return 'contada';
end;
$$;

-- Asocia la cuenta de la sesión (auth.uid(), nunca un parámetro) a la
-- invitación. Solo cuentas nuevas: creadas después de la invitación y hace
-- menos de un día. Una vez asociada, no cambia.
create function public.atribuir_invitacion(p_codigo text) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_invitacion public.invitaciones%rowtype;
  v_creada timestamptz;
  v_filas integer;
begin
  if v_uid is null then
    return false;
  end if;

  select * into v_invitacion from public.invitaciones
  where codigo = p_codigo and estado <> 'cancelada';
  if not found or v_invitacion.user_id = v_uid then
    return false;
  end if;

  select created_at into v_creada from auth.users where id = v_uid;
  if v_creada is null or v_creada < v_invitacion.creado_en or v_creada < now() - interval '1 day' then
    return false;
  end if;

  insert into public.atribuciones (invitacion_id, invitado_id)
  values (v_invitacion.id, v_uid)
  on conflict (invitado_id) do nothing;
  get diagnostics v_filas = row_count;
  return v_filas = 1;
end;
$$;

-- Contadores de la tarjeta del dueño: solo totales, sin datos de nadie.
create function public.resumen_mis_invitaciones() returns table (aperturas bigint, cuentas bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select count(*) from public.aperturas a
       join public.invitaciones i on i.id = a.invitacion_id
      where i.user_id = auth.uid()),
    (select count(*) from public.atribuciones t
       join public.invitaciones i on i.id = t.invitacion_id
      where i.user_id = auth.uid());
$$;

-- Supabase da EXECUTE a todos por defecto: se quita y se da solo lo necesario.
revoke execute on function public.invitacion_valida(text) from public, anon, authenticated;
revoke execute on function public.registrar_apertura(text, text) from public, anon, authenticated;
revoke execute on function public.atribuir_invitacion(text) from public, anon, authenticated;
revoke execute on function public.resumen_mis_invitaciones() from public, anon, authenticated;
revoke execute on function public.invitaciones_codigo_fijo() from public, anon, authenticated;

grant execute on function public.invitacion_valida(text) to anon, authenticated;
grant execute on function public.registrar_apertura(text, text) to anon, authenticated;
grant execute on function public.atribuir_invitacion(text) to authenticated;
grant execute on function public.resumen_mis_invitaciones() to authenticated;
