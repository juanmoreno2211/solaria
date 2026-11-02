import type { ReactNode } from "react";
import { PERFORMANCE_RATIO, SUPUESTOS } from "@/lib/config/pricing";
import { formatCOPMiles, formatDecimal, formatNumber } from "@/lib/format";
import { numeroPaneles, type Cifras } from "@/lib/savings/cifras";
import type { AlternativaResultado, AnalisisResultado } from "@/lib/savings/types";
import { FinancialSummary } from "./FinancialSummary";

const pct = (n: number) => `${Math.round(n * 100)} %`;
function Paso({ n, titulo, children }: { n: number; titulo: string; children: ReactNode }) {
  return <li className="grid grid-cols-[16px_minmax(0,1fr)] gap-2.5"><span aria-hidden="true" className="pt-0.5 text-[11px] text-sun-600">{n}.</span><div><h5 className="text-[13px] font-medium text-ink-950">{titulo}</h5><div className="mt-1 text-xs leading-6 text-ink-800/70">{children}</div></div></li>;
}
export function ComoCalculamos({ resultado, paneles, cifras, horario }: { resultado: AnalisisResultado; paneles: AlternativaResultado; cifras: Cifras; horario?: string }) {
  const { ubicacion, cobertura, consumoMensualKwh } = resultado;
  const cubiertos = consumoMensualKwh * cobertura;
  return <div>
    <ol role="list" className="list-none space-y-4 p-0">
      <Paso n={1} titulo="Cuánta energía cubrirían los paneles">Sin baterías, se aprovecha la energía mientras hay sol.{horario ? ` Para el horario ${horario.toLowerCase()},` : ""} se toma el {pct(cobertura)} de {formatNumber(consumoMensualKwh)} kWh: aproximadamente {formatNumber(Math.round(cubiertos))} kWh al mes.</Paso>
      <Paso n={2} titulo="Qué tamaño tendría el sistema">En {ubicacion.departamento ?? "tu región"}, con {formatDecimal(ubicacion.hsp)} horas de sol pico y rendimiento del {pct(PERFORMANCE_RATIO)}, cada kWp produciría unos {formatNumber(Math.round(ubicacion.hsp * 30 * PERFORMANCE_RATIO))} kWh al mes. Se estiman {formatDecimal(paneles.kwpRequeridos)} kWp, unos {numeroPaneles(paneles.kwpRequeridos)} paneles de {SUPUESTOS.wattsPanel} W.</Paso>
      <Paso n={3} titulo="Cuánto ahorrarías el primer año">El ahorro energético inicial es de {formatCOPMiles(cifras.ahorroMensual)} al mes, antes del mantenimiento. La proyección reduce la generación un 0,5 % cada año; no se atribuye ahorro adicional por cortes evitados.</Paso>
      <Paso n={4} titulo="Qué inversión y costos se usan">{cifras.finanzas ? <FinancialSummary finanzas={cifras.finanzas} /> : <p>Inversión: {formatCOPMiles(cifras.inversion)}. Mantenimiento: {formatCOPMiles(cifras.mantenimientoMensual)} al mes. La propuesta final la confirma el instalador.</p>}</Paso>
      <Paso n={5} titulo="Cómo se obtiene la recuperación">Se acumula el ahorro de cada año y se restan inversión, mantenimiento y reposiciones aplicables.{cifras.finanzas?.simulacionTributaria ? " Se añade el beneficio de renta simulado, sujeto a validación." : " No se suman incentivos tributarios por defecto."} {cifras.retornoMeses === null ? "Con estos datos no se recupera de forma sostenida dentro de los 20 años." : `El balance deja de ser negativo dentro del horizonte tras unos ${formatDecimal(cifras.retornoMeses / 12)} años.`}</Paso>
    </ol>
    <p className="mt-5 border-t border-ink-950/8 pt-3 text-[11px] leading-[1.8] text-ink-800/55">Los valores están expresados en pesos de hoy. Se supone una inflación de {pct(SUPUESTOS.inflacionAnual)} anual común a tarifa y mantenimiento, por lo que no se añade otra vez al saldo real. Se incluye degradación solar del 0,5 % anual. No se incluyen venta de excedentes ni beneficios fiscales sin los datos necesarios. La propuesta final la define el instalador.</p>
  </div>;
}
