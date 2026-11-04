-- Nuevo valor de referencia de la nevera (150 W, 40 % del tiempo, ≈ 43 kWh al
-- mes en vez de ≈ 174). Solo cambia las neveras que siguen con el valor
-- anterior del catálogo; las que el usuario corrigió se quedan como están.
-- Correr después de 20261105000000_solicitudes_contacto.sql.

update public.aparatos
set potencia_w = 150, factor_ciclo = 0.4
where tipo_catalogo = 'nevera'
  and potencia_w = 725
  and round(factor_ciclo * 100) = 33
  and horas_dia = 24
  and kwh_anio_etiqueta is null;
