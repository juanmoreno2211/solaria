import { MANTENIMIENTO_ANUAL } from "@/lib/config/pricing";

/**
 * Meses para recuperar la inversión: inversión ÷ (ahorro anual − mantenimiento)
 * × 12. null si no hay inversión o si el ahorro no alcanza a cubrir el mantenimiento.
 */
export function calcularRetornoMeses(inversion: number, ahorroMensual: number): number | null {
  const ahorroAnualNeto = ahorroMensual * 12 - inversion * MANTENIMIENTO_ANUAL;
  return inversion > 0 && ahorroAnualNeto > 0 ? (inversion / ahorroAnualNeto) * 12 : null;
}
