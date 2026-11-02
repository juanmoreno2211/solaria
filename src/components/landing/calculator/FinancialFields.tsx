"use client";

import { useId } from "react";
import type { CampoFinanciero, FinanzasFormState } from "@/lib/savings/financial-types";
import type { ConexionElectrica } from "@/lib/catalog/types";

export function FinancialFields({ value, onChange, conexion }: { value: FinanzasFormState; onChange: (v: FinanzasFormState) => void; conexion: ConexionElectrica | "" }) {
  const id = useId();
  const bateria = conexion === "intermitente" || conexion === "sin_red";
  const inputClass = "mt-1.5 w-full min-w-0 rounded-lg border border-ink-950/15 bg-white px-3 py-2.5 text-base text-ink-950 outline-none focus:ring-2 focus:ring-sun-500/40 disabled:opacity-40 sm:text-sm";
  function campo(key: CampoFinanciero, label: string, placeholder: string, max = 1_000_000_000_000, disabled = false) {
    return <label className="min-w-0 text-xs leading-relaxed text-ink-800/75" htmlFor={`${id}-${key}`}>{label}<input id={`${id}-${key}`} className={inputClass} type="number" inputMode="decimal" min={key === "inversionTotalCOP" ? 1 : key === "aniosReposicionBateria" ? 8 : key === "aniosReposicionInversor" ? 10 : 0} max={max} step={key.startsWith("aniosReposicion") ? 1 : "any"} placeholder={placeholder} value={value[key] ?? ""} disabled={disabled} onChange={(e) => onChange({ ...value, [key]: e.target.value })} /></label>;
  }
  return (
    <details className="rounded-xl border border-ink-950/10 p-4">
      <summary className="cursor-pointer text-sm font-medium text-ink-950">Presupuesto y costos (opcional)</summary>
      <p className="mt-2 text-xs leading-relaxed text-ink-800/60">Si ya tienes una cotización, úsala para afinar la estimación. Si no, se mostrarán referencias de presupuesto con sus supuestos. Los valores se ingresan en pesos de hoy.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {campo("inversionTotalCOP", "Cotización total instalada (COP)", "Ej. 28000000")}
        {campo("costosAdicionalesCOP", "Transporte y obras adicionales (COP)", "Pendiente si se deja vacío", undefined, Boolean(value.inversionTotalCOP?.trim()))}
        {campo("mantenimientoAnualCOP", "Mantenimiento de todo el sistema al año (COP)", "Por defecto: 1,5 % de inversión")}
        {bateria && campo("reposicionBateriaCOP", "Reposición de baterías, incluido montaje (COP)", "Referencia si se deja vacío")}
        {bateria && campo("aniosReposicionBateria", "Años entre reposiciones de batería", "10, supuesto a validar", 15)}
        {campo("reposicionInversorCOP", "Reposición del inversor, incluido montaje (COP)", "No incluida sin valor ingresado")}
        {campo("aniosReposicionInversor", "Año de reposición del inversor", "12, si se ingresa un costo", 15)}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-ink-800/55">El total cotizado debe incluir baterías, inversor, instalación y transporte: no se vuelven a sumar sus componentes. El plazo de reposición es un supuesto, no una garantía de vida útil.</p>
      {conexion === "sin_red" && <div className="mt-4 grid gap-4 border-t border-ink-950/10 pt-4 sm:grid-cols-2">
        {campo("costoEnergiaActualCOP", "Gasto mensual actual en energía (COP)", "Combustible, alquiler o servicio")}
        {campo("porcentajeCostoEvitable", "Parte de ese gasto que se sustituiría (%)", "A validar, de 0 a 100", 100)}
        <p className="text-xs leading-relaxed text-ink-800/55 sm:col-span-2">Se compara únicamente el gasto que el sistema sustituiría. No se transforma el precio del diésel en kWh ni se supone que todo el combustible desaparece.</p>
      </div>}
      <div className="mt-4 border-t border-ink-950/10 pt-4">
        <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-ink-800/80"><input type="checkbox" checked={value.simularDeduccion ?? false} onChange={(e) => onChange({ ...value, simularDeduccion: e.target.checked })} className="mt-0.5 h-4 w-4 shrink-0 accent-sun-500" />Simular deducción especial de renta</label>
        {value.simularDeduccion && <>
          <p className="mt-2 text-xs leading-relaxed text-ink-800/60">Es una simulación para revisar con el contador. La deducción reduce la renta gravable; no devuelve el 50 % de la inversión. Estar constituido no demuestra elegibilidad.</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {campo("baseElegibleCOP", "Inversión elegible para deducción (COP)", "Base que validará el contador")}
            {campo("tarifaRentaPct", "Tarifa de renta aplicable (%)", "No se presume una tarifa", 100)}
            {campo("rentaLiquidaAnualCOP", "Renta líquida anual antes de deducción (COP)", "Puede ser 0")}
          </div>
        </>}
        <p className="mt-3 text-xs leading-relaxed text-ink-800/55">IVA y aranceles no se descuentan automáticamente. La certificación UPME y el régimen tributario deben validarse antes de aplicar beneficios.</p>
      </div>
    </details>
  );
}
