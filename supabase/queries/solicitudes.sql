-- Solicitudes de "Quiero que me contacten", las más nuevas primero.
-- Correr en el SQL Editor de Supabase. Excluye las de prueba (SIA-PRUEBA).
select
  creado_en at time zone 'America/Bogota' as fecha,
  nombre,
  celular,
  municipio,
  proveedor,
  compartir_con_proveedor,
  estimado ->> 'consumoKwh' as consumo_kwh,
  estimado ->> 'valorFactura' as valor_recibo,
  ref,
  estado
from public.solicitudes_contacto
where coalesce(ref, '') <> 'SIA-PRUEBA'
order by creado_en desc;

-- Para marcar una como contactada:
-- update public.solicitudes_contacto set estado = 'contactada' where id = '...';
