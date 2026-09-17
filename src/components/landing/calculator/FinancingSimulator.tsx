"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TooltipContentProps } from "recharts";
import { Landmark } from "lucide-react";
import { formatCOP } from "@/lib/format";
import type { AlternativaResultado } from "@/lib/savings/types";

function cuotaMensual(monto: number, tasaAnualPct: number, plazoAnios: number): number {
  const i = tasaAnualPct / 100 / 12;
  const n = plazoAnios * 12;
  if (i === 0) return monto / n;
  return (monto * i) / (1 - Math.pow(1 + i, -n));
}

function TooltipBarra({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-ink-950">{item.payload.name}</p>
      <p className="text-ink-800/70">{formatCOP(Number(item.value))} / mes</p>
    </div>
  );
}

export function FinancingSimulator({
  mejor,
}: {
  mejor: AlternativaResultado;
}) {
  const [plazoAnios, setPlazoAnios] = useState(5);
  const [tasaAnual, setTasaAnual] = useState(19.5);

  const inversionPromedio = Math.round(
    (mejor.inversionEstimadaMin + mejor.inversionEstimadaMax) / 2
  );

  const cuota = useMemo(
    () => Math.round(cuotaMensual(inversionPromedio, tasaAnual, plazoAnios)),
    [inversionPromedio, tasaAnual, plazoAnios]
  );

  const flujoNeto = mejor.ahorroMensualEstimado - cuota;

  const dataBarras = [
    { name: "Cuota estimada", value: cuota, color: "#f2751a" },
    { name: "Tu ahorro mensual", value: mejor.ahorroMensualEstimado, color: "#22c55e" },
  ];

  return (
    <div className="mt-6 rounded-2xl border border-black/8 bg-white p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ember-500/12 text-ember-600">
          <Landmark className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink-950">
            ¿Y si financias {mejor.nombre.toLowerCase()}?
          </p>
          <p className="text-xs text-ink-800/50">
            Compara la cuota estimada del crédito con tu ahorro mensual
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <div className="flex items-center justify-between text-xs text-ink-800/60">
            <span>Plazo del crédito</span>
            <span className="font-semibold text-ink-950">{plazoAnios} años</span>
          </div>
          <input
            type="range"
            min={2}
            max={10}
            step={1}
            value={plazoAnios}
            onChange={(e) => setPlazoAnios(Number(e.target.value))}
            className="mt-2 w-full accent-sun-500"
          />

          <div className="mt-4 flex items-center justify-between text-xs text-ink-800/60">
            <span>Tasa de interés estimada (E.A.)</span>
            <span className="font-semibold text-ink-950">{tasaAnual.toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={30}
            step={0.5}
            value={tasaAnual}
            onChange={(e) => setTasaAnual(Number(e.target.value))}
            className="mt-2 w-full accent-sun-500"
          />
          <p className="mt-2 text-[11px] leading-relaxed text-ink-800/40">
            Tasa de referencia para crédito de libre inversión en Colombia; ajústala
            según la oferta real de tu banco. Inversión financiada: {formatCOP(inversionPromedio)}.
          </p>
        </div>

        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataBarras} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#14110c99" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip content={TooltipBarra} cursor={{ fill: "#14110c08" }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={64} isAnimationActive={false}>
                {dataBarras.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div
        className={`mt-5 rounded-xl px-4 py-3 text-sm ${
          flujoNeto >= 0
            ? "bg-leaf-500/8 text-leaf-800"
            : "bg-ember-500/8 text-ember-800"
        }`}
      >
        {flujoNeto >= 0 ? (
          <>
            Con estas condiciones, tu ahorro mensual cubre la cuota y te queda un{" "}
            <span className="font-semibold">flujo positivo de {formatCOP(flujoNeto)}/mes</span>{" "}
            desde el primer mes, aunque estés pagando el crédito.
          </>
        ) : (
          <>
            Con estas condiciones, la cuota supera tu ahorro mensual por{" "}
            <span className="font-semibold">{formatCOP(Math.abs(flujoNeto))}/mes</span>.
            Prueba un plazo más largo o revisa una tasa más baja.
          </>
        )}
      </div>
    </div>
  );
}
