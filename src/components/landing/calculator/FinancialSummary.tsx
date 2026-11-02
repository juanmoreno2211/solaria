import { REFERENCIAS_COSTOS, SUPUESTOS_FINANCIEROS } from "@/lib/config/costs";
import { formatCOPMiles } from "@/lib/format";
import type { AnalisisFinanciero } from "@/lib/savings/financial-types";

export function FinancialSummary({ finanzas: f }: { finanzas: AnalisisFinanciero }) {
  return <div className="space-y-3 text-xs leading-6 text-ink-800/70">
    {f.inversion !== null ? <>
      <p className="font-medium text-ink-950">{f.origen === "cotizacion_usuario" ? "Total instalado ingresado" : "Presupuesto orientativo"}: {formatCOPMiles(f.inversion)}</p>
      {f.origen !== "cotizacion_usuario" && <>
        <p>Rango de referencia: {formatCOPMiles(f.inversionMin!)} a {formatCOPMiles(f.inversionMax!)}.</p>
        <dl className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 tabular-nums">
          <dt>Sistema solar e instalación base</dt><dd>{formatCOPMiles(f.origen === "catalogo" ? f.inversion - f.adicionales : f.solar)}</dd>
          {f.bateria > 0 && <><dt>Batería: {f.modulosBateria} módulos, {f.capacidadPresupuestadaKwh.toLocaleString("es-CO", { maximumFractionDigits: 2 })} kWh nominales</dt><dd>{formatCOPMiles(f.bateria)}</dd></>}
          {f.adecuacion > 0 && <><dt>Margen para adecuación de respaldo</dt><dd>{formatCOPMiles(f.adecuacion)}</dd></>}
          {f.adicionales > 0 && <><dt>Transporte y obras ingresados</dt><dd>{formatCOPMiles(f.adicionales)}</dd></>}
        </dl>
      </>}
      <p>Mantenimiento de todo el sistema: {formatCOPMiles(f.mantenimientoAnual ?? 0)} al año.</p>
      {f.reposicionBateriaCOP > 0 && <p>Reposición presupuestada: {formatCOPMiles(f.reposicionBateriaCOP)} cada {f.aniosReposicionBateria} años, en pesos de hoy. Es un supuesto a validar.</p>}
    </> : null}
    {f.reposicionInversorCOP > 0 && <p>Reposición del inversor: {formatCOPMiles(f.reposicionInversorCOP)} en el año {f.aniosReposicionInversor}.</p>}
    {f.costoEnergiaActualCOP !== undefined && <p>Comparación sin red: gasto actual de {formatCOPMiles(f.costoEnergiaActualCOP)} al mes y sustitución estimada del {f.porcentajeCostoEvitable} %.</p>}
    {f.motivo && <p>{f.motivo}</p>}
    {f.simulacionTributaria && f.proyeccion && <p>Beneficio de renta simulado en el horizonte: {formatCOPMiles(f.proyeccion.ahorroTributarioTotal)}.{f.proyeccion.deduccionNoUtilizada > 0 ? ` Quedaría sin utilizar una deducción de ${formatCOPMiles(f.proyeccion.deduccionNoUtilizada)} al finalizar el plazo fiscal.` : ""} No es una devolución directa de la inversión.</p>}
    <details><summary className="cursor-pointer font-medium text-ink-950">Supuestos y referencias</summary>
      <ul className="mt-2 list-disc space-y-2 pl-4">{f.supuestos.map((s) => <li key={s}>{s}</li>)}</ul>
      <p className="mt-2">La deducción de renta requiere validación de requisitos y certificación UPME. IVA y aranceles se revisan por bienes y servicios elegibles. La depreciación acelerada tiene un límite legal de {SUPUESTOS_FINANCIEROS.depreciacionMaximaAnualPct.toLocaleString("es-CO")} % anual, sin sumarse aquí como ingreso. <a className="underline underline-offset-2" href={REFERENCIAS_COSTOS.normativa} target="_blank" rel="noopener noreferrer">Ley 1715, artículos 11 a 14</a>.</p>
    </details>
  </div>;
}
