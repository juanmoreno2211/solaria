"use client";

import {
  Area,
  AreaChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import { formatCOP } from "@/lib/format";
import { MANTENIMIENTO_ANUAL } from "@/lib/config/pricing";
import type { AlternativaResultado } from "@/lib/savings/types";

function TooltipProyeccion({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const valor = Number(payload[0].value);
  return (
  <div className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs shadow-lg">
    <p className="font-semibold text-ink-950">Año {label}</p>
    <p className={valor >= 0 ? "text-leaf-700" : "text-ember-600"}>
      {valor >= 0 ? "Ganancia neta: " : "Aún recuperando: "}
      {formatCOP(Math.abs(valor))}
    </p>
  </div>
);
}

export function SavingsCharts({ mejor }: { mejor: AlternativaResultado }) {
const inversionPromedio =
  (mejor.inversionEstimadaMin + mejor.inversionEstimadaMax) / 2;

const dataProyeccion = Array.from({ length: 26 }, (_, anio) => ({
  anio,
  neto: Math.round(
    (mejor.ahorroMensualEstimado * 12 - inversionPromedio * MANTENIMIENTO_ANUAL) * anio -
      inversionPromedio
  ),
}));

const anioEquilibrio = mejor.retornoMeses ? mejor.retornoMeses / 12 : null;

return (
    <div className="rounded-2xl border border-black/8 bg-white p-6">
      <p className="text-sm font-semibold text-ink-950">
        Proyección de {mejor.nombre.toLowerCase()} a 25 años
      </p>
      <p className="mt-1 text-xs text-ink-800/50">
        Ahorro acumulado neto (descontando inversión y mantenimiento)
        {anioEquilibrio &&
          ` · punto de equilibrio ≈ año ${anioEquilibrio.toFixed(1)}`}
      </p>
      <div className="mt-2 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dataProyeccion} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorNeto" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3f9c67" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#3f9c67" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="anio"
              tickFormatter={(v) => `${v}`}
              tick={{ fontSize: 11, fill: "#14110c99" }}
              axisLine={false}
              tickLine={false}
              interval={4}
            />
            <YAxis hide />
            <Tooltip content={TooltipProyeccion} />
            <ReferenceLine y={0} stroke="#14110c33" strokeDasharray="3 3" />
            <Area
              type="monotone"
              dataKey="neto"
              stroke="#2f7d50"
              strokeWidth={2}
              fill="url(#colorNeto)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
