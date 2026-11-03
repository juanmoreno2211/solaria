import { presupuestoSolar } from "@/lib/config/costs";
import type { AnalisisFinanciero } from "./financial-types";
import { proyectar20Anios, type ProjectionResult } from "./projection";
import { MANTENIMIENTO_ANUAL, SUPUESTOS } from "@/lib/config/pricing";
import { calcularRetornoMeses } from "./retorno";
import type { AlternativaResultado, OfertaProveedor } from "./types";

/**
 * Las cifras que se muestran en todo el resultado. Salen de un solo lugar para
 * que la recomendación, la gráfica, el crédito y el paso de WhatsApp coincidan.
 */
export interface Cifras {
  finanzas?: AnalisisFinanciero;
  inversion: number;
  ahorroMensual: number;
  mantenimientoMensual: number;
  retornoMeses: number | null;
  /** Oferta con la que se calcularon, si hay una. */
  oferta?: OfertaProveedor;
}

export function cifrasDeOferta(oferta: OfertaProveedor): Cifras {
  return {
    inversion: oferta.inversion,
    ahorroMensual: oferta.ahorroMensual,
    mantenimientoMensual: oferta.mantenimientoMensual,
    retornoMeses: oferta.retornoMeses,
    oferta,
  };
}

/** Las del mejor proveedor; si ninguno aplica, el precio de referencia por kWp. */
export function cifrasPrincipales(paneles: AlternativaResultado): Cifras {
  const f = paneles.finanzas;
  if (f?.proyeccion && f.inversion !== null && f.ahorroMensualBase !== null && f.mantenimientoAnual !== null) return {
    inversion: f.inversion, ahorroMensual: f.ahorroMensualBase,
    mantenimientoMensual: f.mantenimientoAnual / 12,
    retornoMeses: f.proyeccion.retornoAnios === null ? null : f.proyeccion.retornoAnios * 12,
    oferta: paneles.mejorOferta, finanzas: f,
  };
  if (paneles.mejorOferta) return cifrasDeOferta(paneles.mejorOferta);
  const inversion = paneles.inversionBase ?? (paneles.kwpRequeridos > 0 ? presupuestoSolar(paneles.kwpRequeridos).base : 0);
  return {
    inversion,
    ahorroMensual: paneles.ahorroMensualEstimado,
    mantenimientoMensual: (inversion * MANTENIMIENTO_ANUAL) / 12,
    retornoMeses: calcularRetornoMeses(inversion, paneles.ahorroMensualEstimado),
  };
}

export function numeroPaneles(kwp: number): number {
  return Math.max(1, Math.ceil((kwp * 1000) / SUPUESTOS.wattsPanel));
}

/** Misma proyección para tarjeta, gráfica y explicación. */
export function proyeccionDeCifras(cifras: Cifras): ProjectionResult {
  return cifras.finanzas?.proyeccion ?? proyectar20Anios({ inversion: cifras.inversion, ahorroMensual: cifras.ahorroMensual, mantenimientoAnualCOP: cifras.mantenimientoMensual * 12 });
}

/** Cuota fija mensual de un crédito con tasa efectiva anual. */
export function cuotaCredito(
  monto: number,
  tasaEA = SUPUESTOS.tasaCreditoEA,
  plazoAnios = SUPUESTOS.plazoCreditoAnios
): number {
  const i = Math.pow(1 + tasaEA, 1 / 12) - 1;
  const n = plazoAnios * 12;
  return i === 0 ? monto / n : (monto * i) / (1 - Math.pow(1 + i, -n));
}
