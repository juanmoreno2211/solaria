import type { CampoFinanciero, FinanzasInput } from "./financial-types";
export const CAMPOS_FINANCIEROS: CampoFinanciero[] = ["inversionTotalCOP", "costosAdicionalesCOP", "mantenimientoAnualCOP", "costoEnergiaActualCOP", "porcentajeCostoEvitable", "reposicionBateriaCOP", "aniosReposicionBateria", "reposicionInversorCOP", "aniosReposicionInversor", "baseElegibleCOP", "tarifaRentaPct", "rentaLiquidaAnualCOP"];
export function errorFinanzas(f: FinanzasInput): string | null {
  for (const key of CAMPOS_FINANCIEROS) {
    const n = f[key];
    if (n !== undefined && (!Number.isFinite(n) || n < 0 || n > 1_000_000_000_000)) return "Los datos de presupuesto deben ser números válidos, sin valores negativos.";
  }
  if (f.inversionTotalCOP !== undefined && f.inversionTotalCOP <= 0) return "La inversión total cotizada debe ser mayor que cero.";
  if (f.aniosReposicionBateria !== undefined && (!Number.isInteger(f.aniosReposicionBateria) || f.aniosReposicionBateria < 8 || f.aniosReposicionBateria > 15)) return "El supuesto de reposición debe estar entre 8 y 15 años.";
  if (f.aniosReposicionInversor !== undefined && (!Number.isInteger(f.aniosReposicionInversor) || f.aniosReposicionInversor < 10 || f.aniosReposicionInversor > 15)) return "El supuesto de reposición del inversor debe estar entre 10 y 15 años.";
  if ((f.porcentajeCostoEvitable ?? 0) > 100 || (f.tarifaRentaPct ?? 0) > 100) return "Los porcentajes deben estar entre 0 y 100.";
  if (f.simularDeduccion && [f.baseElegibleCOP, f.tarifaRentaPct, f.rentaLiquidaAnualCOP].some((n) => n === undefined)) return "Para simular renta, completa base elegible, tarifa de renta y renta líquida anual.";
  if (f.simularDeduccion && f.inversionTotalCOP !== undefined && (f.baseElegibleCOP ?? 0) > f.inversionTotalCOP) return "La base elegible no puede superar la inversión total cotizada.";
  return null;
}
