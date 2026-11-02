"use client";

import type { NegocioFormState } from "./StepProperty";

/** Conexión y ubicación están en LocationSelector; aquí solo se piden datos de respaldo. */
export function EnergyContextFields({ value, onChange }: { value: NegocioFormState; onChange: (v: NegocioFormState) => void }) {
  if (value.conexion !== "intermitente" && value.conexion !== "sin_red") return null;
  const inputClass = "mt-1.5 w-full min-w-0 rounded-lg border border-ink-950/15 bg-white px-3 py-2.5 text-base text-ink-950 focus:outline-none focus:ring-2 focus:ring-sun-500/40 sm:text-sm";
  return (
    <details className="rounded-xl border border-ink-950/10 p-4">
      <summary className="cursor-pointer text-sm font-semibold text-ink-950">Estimar batería para cargas de respaldo (opcional)</summary>
      <p className="mt-2 text-xs leading-relaxed text-ink-800/60">Este cálculo orienta cuánta energía deben guardar las baterías para los equipos que quieras mantener encendidos. Completa ambos datos si los conoces; también puedes dejarlos vacíos y revisarlos en la visita técnica.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-medium text-ink-800/75">Potencia media de los equipos (W)
          <input className={inputClass} type="number" inputMode="decimal" min="0.1" max="1000000" step="any" value={value.potenciaCriticaW} onChange={(e) => onChange({ ...value, potenciaCriticaW: e.target.value })} placeholder="Ej. 500" />
        </label>
        <label className="text-xs font-medium text-ink-800/75">Horas de respaldo deseadas
          <input className={inputClass} type="number" inputMode="decimal" min="0.1" max="168" step="any" value={value.horasAutonomia} onChange={(e) => onChange({ ...value, horasAutonomia: e.target.value })} placeholder="Ej. 4" />
        </label>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-ink-800/55">Usa la potencia media de tus equipos</p>
    </details>
  );
}
