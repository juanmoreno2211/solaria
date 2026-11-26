import { SUPUESTOS_FINANCIEROS } from "@/lib/config/costs";

export interface Reposicion { anio: number; costo: number; concepto?: string; }
export interface DeduccionRenta { baseElegibleCOP: number; tarifaRentaPct: number; rentaLiquidaAnualCOP: number; }
export interface ProjectionInput {
  inversion: number;
  ahorroMensual: number;
  /** Variación real, después de inflación. */
  variacionTarifaPct?: number;
  degradacionPct?: number;
  mantenimientoAnualPct?: number;
  mantenimientoAnualCOP?: number;
  reposiciones?: Reposicion[];
  deduccionRenta?: DeduccionRenta;
  /** Tasa real anual para descontar los flujos futuros a valor presente. */
  tasaDescuentoPct?: number;
}
export interface ProjectionRow {
  anio: number; ahorroBruto: number; mantenimiento: number;
  reposiciones: number; deduccionRenta: number; ahorroTributario: number;
  ahorroNetoAnual: number; netoAcumulado: number;
  /** Balance acumulado con cada flujo llevado a valor presente. */
  netoAcumuladoPresente: number;
}
export interface ProjectionResult {
  rows: ProjectionRow[];
  /** Recuperación que no vuelve a quedar negativa dentro del horizonte analizado. */
  retornoAnios: number | null;
  neto20: number;
  /** Valor presente neto a 20 años. */
  vpn: number;
  /** Recuperación usando los flujos descontados (más exigente que retornoAnios). */
  retornoDescontadoAnios: number | null;
  tasaDescuentoPct: number;
  ahorroTributarioTotal: number;
  deduccionNoUtilizada: number;
}
export function proyectar20Anios({ inversion, ahorroMensual, variacionTarifaPct = SUPUESTOS_FINANCIEROS.variacionRealTarifaPct, degradacionPct = .5, mantenimientoAnualPct = 1.5, mantenimientoAnualCOP, reposiciones = [], deduccionRenta, tasaDescuentoPct = SUPUESTOS_FINANCIEROS.tasaDescuentoRealPct }: ProjectionInput): ProjectionResult {
  if (![inversion, ahorroMensual, variacionTarifaPct, degradacionPct, mantenimientoAnualPct, tasaDescuentoPct].every(Number.isFinite) || tasaDescuentoPct <= -100 || inversion < 0 || ahorroMensual < 0 || variacionTarifaPct <= -100 || degradacionPct < 0 || degradacionPct >= 100 || mantenimientoAnualPct < 0 || (mantenimientoAnualCOP !== undefined && (!Number.isFinite(mantenimientoAnualCOP) || mantenimientoAnualCOP < 0))) throw new RangeError("Supuestos de proyección inválidos.");
  if (reposiciones.some((r) => !Number.isInteger(r.anio) || r.anio < 1 || r.anio > 20 || !Number.isFinite(r.costo) || r.costo < 0)) throw new RangeError("Reposición inválida.");
  if (deduccionRenta && (![deduccionRenta.baseElegibleCOP, deduccionRenta.tarifaRentaPct, deduccionRenta.rentaLiquidaAnualCOP].every(Number.isFinite) || deduccionRenta.baseElegibleCOP < 0 || deduccionRenta.baseElegibleCOP > inversion || deduccionRenta.tarifaRentaPct < 0 || deduccionRenta.tarifaRentaPct > 100 || deduccionRenta.rentaLiquidaAnualCOP < 0)) throw new RangeError("Datos tributarios inválidos.");
  const rows: ProjectionRow[] = [{ anio: 0, ahorroBruto: 0, mantenimiento: 0, reposiciones: 0, deduccionRenta: 0, ahorroTributario: 0, ahorroNetoAnual: 0, netoAcumulado: -inversion, netoAcumuladoPresente: -inversion }];
  let acumulado = -inversion;
  let acumuladoPresente = -inversion;
  let restante = (deduccionRenta?.baseElegibleCOP ?? 0) * .5;
  let ahorroTributarioTotal = 0;
  const mantenimientoBase = mantenimientoAnualCOP ?? inversion * mantenimientoAnualPct / 100;
  for (let anio = 1; anio <= 20; anio++) {
    const factor = (1 + variacionTarifaPct / 100) ** (anio - 1);
    const ahorroBruto = ahorroMensual * 12 * factor * (1 - degradacionPct / 100) ** (anio - 1);
    // Todo está expresado en pesos de hoy; la inflación común no se suma otra vez.
    const mantenimiento = mantenimientoBase;
    const reposicion = reposiciones.filter((r) => r.anio === anio).reduce((s, r) => s + r.costo, 0);
    const deduccion = deduccionRenta && anio <= 15 ? Math.min(restante, deduccionRenta.rentaLiquidaAnualCOP * .5) : 0;
    restante = Math.max(0, restante - deduccion);
    const ahorroTributario = deduccion * (deduccionRenta?.tarifaRentaPct ?? 0) / 100;
    ahorroTributarioTotal += ahorroTributario;
    const ahorroNetoAnual = ahorroBruto - mantenimiento - reposicion + ahorroTributario;
    acumulado += ahorroNetoAnual;
    if (Math.abs(acumulado) < 1e-7) acumulado = 0;
    acumuladoPresente += ahorroNetoAnual / (1 + tasaDescuentoPct / 100) ** anio;
    if (Math.abs(acumuladoPresente) < 1e-7) acumuladoPresente = 0;
    rows.push({ anio, ahorroBruto, mantenimiento, reposiciones: reposicion, deduccionRenta: deduccion, ahorroTributario, ahorroNetoAnual, netoAcumulado: acumulado, netoAcumuladoPresente: acumuladoPresente });
  }
  return {
    rows, retornoAnios: recuperacion(rows, "netoAcumulado"), neto20: acumulado,
    vpn: acumuladoPresente, retornoDescontadoAnios: recuperacion(rows, "netoAcumuladoPresente"), tasaDescuentoPct,
    ahorroTributarioTotal, deduccionNoUtilizada: restante,
  };
}

/** Año (con fracción) en que el saldo deja de ser negativo y no vuelve a serlo dentro del horizonte. */
function recuperacion(rows: ProjectionRow[], campo: "netoAcumulado" | "netoAcumuladoPresente"): number | null {
  if (rows[rows.length - 1][campo] < 0) return null;
  const ultimoNegativo = rows.findLastIndex((r) => r[campo] < 0);
  if (ultimoNegativo < 0) return 0;
  const a = rows[ultimoNegativo], b = rows[ultimoNegativo + 1];
  return a.anio + -a[campo] / (b[campo] - a[campo]);
}
