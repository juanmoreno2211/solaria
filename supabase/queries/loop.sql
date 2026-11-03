-- Growth loop de invitaciones. Correr en el SQL Editor de Supabase (lee
-- auth.users, así que necesita el rol de administrador del editor).
-- Se excluyen las cuentas @example.com (las crean las pruebas): tanto las de
-- quien invita como las de los invitados.
--
-- Invitado activado: creó su cuenta con un enlace y vio su ranking.

with cuentas as (
  select id from auth.users where email not ilike '%@example.com'
),
invitaciones as (
  select i.id
  from public.invitaciones i
  join cuentas c on c.id = i.user_id
  where i.codigo is not null
),
aperturas as (
  select a.id
  from public.aperturas a
  join invitaciones i on i.id = a.invitacion_id
),
invitados as (
  select t.invitado_id
  from public.atribuciones t
  join invitaciones i on i.id = t.invitacion_id
  join cuentas c on c.id = t.invitado_id
),
activados as (
  select distinct v.invitado_id
  from invitados v
  join public.eventos e on e.user_id = v.invitado_id and e.evento = 'ranking_visto'
)
select
  (select count(*) from invitaciones) as invitaciones_creadas,
  (select count(*) from aperturas) as aperturas,
  (select count(*) from invitados) as cuentas_por_invitacion,
  (select count(*) from activados) as invitados_activados,
  round(100.0 * (select count(*) from activados) / nullif((select count(*) from aperturas), 0), 1) as tasa_activados_sobre_aperturas_pct;
