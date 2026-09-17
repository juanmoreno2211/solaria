"use client";

import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps } from "recharts";
import { formatCOP } from "@/lib/format";
import type { AlternativaResultado, AnalisisResultado } from "@/lib/savings/types";

const COLOR_POR_ID: Record<AlternativaResultado["id"], string> = {
  paneles: "#f59e0b",
  iluminacion: "#f2751a",
  refrigeracion: "#22c55e",
};

function TooltipDonut({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-ink-950">{item.name}</p>
      <p className="text-ink-800/70">{formatCOP(Number(item.value))} / mes</p>
    </div>
  );
}

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

export function SavingsCharts({ resultado }: { resultado: AnalisisResultado }) {
  const aplicables = resultado.alternativas.filter((a) => a.aplica);
  const mejor = resultado.alternativas.find(
    (a) => a.id === resultado.mejorAlternativaId
  );

  if (aplicables.length === 0 || !mejor) return null;

  const dataDonut = aplicables.map((a) => ({
    name: a.nombre,
    value: a.ahorroMensualEstimado,
    color: COLOR_POR_ID[a.id],
  }));

  const inversionPromedio =
    (mejor.inversionEstimadaMin + mejor.inversionEstimadaMax) / 2;

  const dataProyeccion = Array.from({ length: 26 }, (_, anio) => ({
    anio,
    neto: Math.round(mejor.ahorroMensualEstimado * 12 * anio - inversionPromedio),
  }));

  const anioEquilibrio = mejor.retornoMeses ? mejor.retornoMeses / 12 : null;

  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="rounded-2xl border border-black/8 bg-white p-6">
        <p className="text-sm font-semibold text-ink-950">
          De dónde sale tu ahorro
        </p>
        <p className="mt-1 text-xs text-ink-800/50">
          Desglose del ahorro mensual estimado por alternativa
        </p>
        <div className="mt-2 h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataDonut}
                dataKey="value"
                nameKey="name"
                innerRadius="60%"
                outerRadius="90%"
                paddingAngle={3}
                stroke="none"
                isAnimationActive={false}
              >
                {dataDonut.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
              <Tooltip content={TooltipDonut} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 space-y-2">
          {dataDonut.map((d) => (
            <div key={d.name} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-ink-800/70">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                {d.name}
              </span>
              <span className="font-semibold text-ink-950">
                {formatCOP(d.value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-black/8 bg-white p-6">
        <p className="text-sm font-semibold text-ink-950">
          Proyección de {mejor.nombre.toLowerCase()} a 25 años
        </p>
        <p className="mt-1 text-xs text-ink-800/50">
          Ahorro acumulado neto (ya descontada la inversión inicial)
          {anioEquilibrio &&
            ` · punto de equilibrio ≈ año ${anioEquilibrio.toFixed(1)}`}
        </p>
        <div className="mt-2 h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dataProyeccion} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNeto" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
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
                stroke="#16a34a"
                strokeWidth={2}
                fill="url(#colorNeto)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
