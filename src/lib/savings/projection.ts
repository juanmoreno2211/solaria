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
}
export interface ProjectionRow {
  anio: number; ahorroBruto: number; mantenimiento: number;
  reposiciones: number; deduccionRenta: number; ahorroTributario: number;
  ahorroNetoAnual: number; netoAcumulado: number;
}
export interface ProjectionResult {
  rows: ProjectionRow[];
  /** Recuperación que no vuelve a quedar negativa dentro del horizonte analizado. */
  retornoAnios: number | null;
  neto20: number;
  ahorroTributarioTotal: number;
  deduccionNoUtilizada: number;
}
export function proyectar20Anios({ inversion, ahorroMensual, variacionTarifaPct = 0, degradacionPct = .5, mantenimientoAnualPct = 1.5, mantenimientoAnualCOP, reposiciones = [], deduccionRenta }: ProjectionInput): ProjectionResult {
  if (![inversion, ahorroMensual, variacionTarifaPct, degradacionPct, mantenimientoAnualPct].every(Number.isFinite) || inversion < 0 || ahorroMensual < 0 || variacionTarifaPct <= -100 || degradacionPct < 0 || degradacionPct >= 100 || mantenimientoAnualPct < 0 || (mantenimientoAnualCOP !== undefined && (!Number.isFinite(mantenimientoAnualCOP) || mantenimientoAnualCOP < 0))) throw new RangeError("Supuestos de proyección inválidos.");
  if (reposiciones.some((r) => !Number.isInteger(r.anio) || r.anio < 1 || r.anio > 20 || !Number.isFinite(r.costo) || r.costo < 0)) throw new RangeError("Reposición inválida.");
  if (deduccionRenta && (![deduccionRenta.baseElegibleCOP, deduccionRenta.tarifaRentaPct, deduccionRenta.rentaLiquidaAnualCOP].every(Number.isFinite) || deduccionRenta.baseElegibleCOP < 0 || deduccionRenta.baseElegibleCOP > inversion || deduccionRenta.tarifaRentaPct < 0 || deduccionRenta.tarifaRentaPct > 100 || deduccionRenta.rentaLiquidaAnualCOP < 0)) throw new RangeError("Datos tributarios inválidos.");
  const rows: ProjectionRow[] = [{ anio: 0, ahorroBruto: 0, mantenimiento: 0, reposiciones: 0, deduccionRenta: 0, ahorroTributario: 0, ahorroNetoAnual: 0, netoAcumulado: -inversion }];
  let acumulado = -inversion;
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
    rows.push({ anio, ahorroBruto, mantenimiento, reposiciones: reposicion, deduccionRenta: deduccion, ahorroTributario, ahorroNetoAnual, netoAcumulado: acumulado });
  }
  let retornoAnios: number | null = null;
  if (acumulado >= 0) {
    const ultimoNegativo = rows.findLastIndex((r) => r.netoAcumulado < 0);
    if (ultimoNegativo < 0) retornoAnios = 0;
    else if (ultimoNegativo < 20) {
      const a = rows[ultimoNegativo], b = rows[ultimoNegativo + 1];
      retornoAnios = a.anio + -a.netoAcumulado / (b.netoAcumulado - a.netoAcumulado);
    }
  }
  return { rows, retornoAnios, neto20: acumulado, ahorroTributarioTotal, deduccionNoUtilizada: restante };
}
