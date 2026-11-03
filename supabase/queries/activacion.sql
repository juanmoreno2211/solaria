-- Activación de Mi negocio. Correr en el SQL Editor de Supabase (lee auth.users,
-- así que necesita el rol de administrador del editor; no la uses desde la app).
--
-- Cuenta activada: dentro de las 48 horas siguientes a crear la cuenta,
-- registró 2 aparatos o más y vio su ranking.
-- Se excluyen las cuentas @example.com (las crea la prueba de RLS).

with cuentas as (
  select id, created_at
  from auth.users
  where email not ilike '%@example.com'
),
aparatos_48h as (
  -- aparato_registrado guarda en detalle.total los aparatos acumulados del usuario.
  select e.user_id, max((e.detalle ->> 'total')::int) as total_aparatos
  from public.eventos e
  join cuentas c on c.id = e.user_id
  where e.evento = 'aparato_registrado'
    and e.creado_en <= c.created_at + interval '48 hours'
  group by e.user_id
),
ranking_48h as (
  select distinct e.user_id
  from public.eventos e
  join cuentas c on c.id = e.user_id
  where e.evento = 'ranking_visto'
    and e.creado_en <= c.created_at + interval '48 hours'
)
select
  (select count(*) from cuentas) as total_cuentas,
  count(*) as cuentas_activadas,
  round(100.0 * count(*) / nullif((select count(*) from cuentas), 0), 1) as porcentaje_activadas
from aparatos_48h a
join ranking_48h r using (user_id)
where a.total_aparatos >= 2;
