import { MANTENIMIENTO_ANUAL, type Region } from "@/lib/config/pricing";
import { buscarPanelesSistemas } from "@/lib/catalog/lookup";
import type { CatalogoPanelSistema } from "@/lib/catalog/types";
import type { OfertaProveedor } from "./types";

/** Cuota fija de un crédito: monto × i ÷ (1 − (1 + i)^−n). */
export function cuotaMensual(monto: number, tasaMensual: number, plazoMeses: number): number {
  if (tasaMensual === 0) return monto / plazoMeses;
  return (monto * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -plazoMeses));
}

/**
 * Calcula, para cada proveedor del catálogo, la inversión, el retorno y la
 * forma de pago con el tamaño de sistema y el ahorro ya estimados.
 * Función pura: no redondea; el redondeo es solo para mostrar.
 */
export function calcularOfertas(
  kwp: number,
  ahorroMensual: number,
  region: Region,
  sistemas?: CatalogoPanelSistema[]
): OfertaProveedor[] {
  return buscarPanelesSistemas(kwp, region, sistemas).map(
    ({ sistema, aplica, motivoNoAplica }) => {
      const inversion = kwp * sistema.precioPorKwpCOP;
      const mantenimientoAnual = inversion * MANTENIMIENTO_ANUAL;
      const ahorroAnualNeto = ahorroMensual * 12 - mantenimientoAnual;

      const oferta: OfertaProveedor = {
        proveedor: sistema.proveedor,
        esSimulado: sistema.esSimulado ?? false,
        aplica,
        motivoNoAplica,
        inversion,
        inversionMin: inversion * 0.9,
        inversionMax: inversion * 1.1,
        mantenimientoMensual: mantenimientoAnual / 12,
        retornoMeses: ahorroAnualNeto > 0 ? (inversion / ahorroAnualNeto) * 12 : null,
        instalacion: sistema.instalacion,
        pagoDescripcion: sistema.pagoDescripcion,
      };

      const f = sistema.financiacion;
      if (f) {
        const cuotaInicial = inversion * f.cuotaInicialPct;
        const monto = inversion - cuotaInicial;
        const cuota = cuotaMensual(monto, f.tasaMensual, f.plazoMeses);
        oferta.financiacion = {
          cuotaInicial,
          monto,
          cuotaMensual: cuota,
          plazoMeses: f.plazoMeses,
          flujoMensual: ahorroMensual - cuota - mantenimientoAnual / 12,
        };
      } else {
        oferta.primerPago = inversion * 0.5;
      }

      return oferta;
    }
  );
}

/** La oferta que aplica con el menor tiempo de retorno. */
export function elegirMejorOferta(
  ofertas: OfertaProveedor[]
): OfertaProveedor | undefined {
  return ofertas
    .filter((o) => o.aplica && o.retornoMeses !== null)
    .reduce<OfertaProveedor | undefined>(
      (mejor, o) => (!mejor || o.retornoMeses! < mejor.retornoMeses! ? o : mejor),
      undefined
    );
}
