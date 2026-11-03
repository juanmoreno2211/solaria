-- Mi negocio: perfil completo, resultado de la calculadora, recibos con
-- historial y aparatos con factor de ciclo. Correr después de
-- 20261102000000_tablas_por_usuario.sql.

-- Quien llega desde la calculadora todavía no ha escrito el nombre.
alter table public.negocios alter column nombre drop not null;

-- Perfil del negocio. tipo_negocio, horario y conexion usan los mismos
-- códigos que la calculadora para poder recalcular su veredicto.
alter table public.negocios
  add column region text check (region in ('caribe', 'andina', 'pacifico', 'orinoquia', 'amazonia', 'insular')),
  add column horario text check (horario in ('dia', 'dia_noche', '24h')),
  add column conexion text check (conexion in ('estable', 'intermitente', 'sin_red', 'no_se')),
  -- Tarifa escrita por el usuario cuando no tiene recibo guardado.
  add column tarifa_manual_kwh numeric check (tarifa_manual_kwh > 0),
  -- Resultado de la calculadora que lo trajo (solo números, sin la foto).
  add column resultado_veredicto text check (resultado_veredicto in ('conviene', 'comparar', 'por_ahora_no', 'sin_proveedores')),
  add column resultado_kwp numeric check (resultado_kwp >= 0),
  add column resultado_ahorro_mensual numeric check (resultado_ahorro_mensual >= 0),
  add column resultado_retorno_meses numeric check (resultado_retorno_meses >= 0),
  add column resultado_guardado_en timestamptz;

-- Aparatos: valores ajustables sobre el catálogo de referencia.
alter table public.aparatos
  add column tipo_catalogo text check (char_length(tipo_catalogo) <= 40),
  add column factor_ciclo numeric not null default 1 check (factor_ciclo > 0 and factor_ciclo <= 1),
  add column dias_mes numeric not null default 30 check (dias_mes > 0 and dias_mes <= 31),
  -- Consumo de la etiqueta energética por unidad; si está, manda sobre potencia × horas.
  add column kwh_anio_etiqueta numeric check (kwh_anio_etiqueta > 0);

-- Cada actualización del recibo es una fila nueva: así queda el historial.
-- Nunca se guarda la foto, solo los números.
create table public.recibos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  consumo_kwh numeric check (consumo_kwh > 0),
  valor numeric check (valor > 0),
  tarifa_kwh numeric generated always as (
    case when consumo_kwh > 0 and valor > 0 then valor / consumo_kwh end
  ) stored,
  -- Primer día del mes del recibo.
  mes date not null default date_trunc('month', now())::date,
  origen text not null default 'manual' check (origen in ('manual', 'calculadora')),
  creado_en timestamptz not null default now(),
  check (consumo_kwh is not null or valor is not null)
);

create index recibos_user_id_creado_idx on public.recibos (user_id, creado_en desc);

alter table public.recibos enable row level security;

create policy "recibos: leer los propios" on public.recibos
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "recibos: crear los propios" on public.recibos
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "recibos: editar los propios" on public.recibos
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "recibos: borrar los propios" on public.recibos
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Lo que ya estaba en negocios pasa a ser el primer recibo. Las columnas
-- consumo_kwh_mes y valor_recibo quedan sin uso; no se borran.
insert into public.recibos (user_id, consumo_kwh, valor, mes, creado_en)
select user_id, nullif(consumo_kwh_mes, 0), nullif(valor_recibo, 0), date_trunc('month', actualizado_en)::date, actualizado_en
from public.negocios
where coalesce(consumo_kwh_mes, 0) > 0 or coalesce(valor_recibo, 0) > 0;
