import { Lightbulb, Snowflake, SunMedium } from "lucide-react";
import clsx from "clsx";
import { formatCOP } from "@/lib/format";
import type { AlternativaResultado } from "@/lib/savings/types";

const ICONS = {
  paneles: SunMedium,
  iluminacion: Lightbulb,
  refrigeracion: Snowflake,
};

const ACCENTS = {
  paneles: {
    icon: "bg-sun-gradient text-ink-950",
    ring: "border-sun-500/30",
    pct: "text-sun-600",
  },
  iluminacion: {
    icon: "bg-ember-500/15 text-ember-600",
    ring: "border-ember-500/25",
    pct: "text-ember-600",
  },
  refrigeracion: {
    icon: "bg-leaf-500/15 text-leaf-600",
    ring: "border-leaf-500/25",
    pct: "text-leaf-600",
  },
};

export function ResultCard({
  alternativa,
  destacada,
}: {
  alternativa: AlternativaResultado;
  destacada: boolean;
}) {
  const Icon = ICONS[alternativa.id];
  const accent = ACCENTS[alternativa.id];

  return (
    <div
      className={clsx(
        "relative flex flex-col rounded-2xl border bg-white p-6",
        destacada ? clsx("border-2", accent.ring) : "border-black/8"
      )}
    >
      {destacada && (
        <span className="absolute -top-3 left-6 rounded-full bg-ink-950 px-3 py-1 text-[11px] font-semibold text-white">
          Recomendado para ti
        </span>
      )}

      <div className="flex items-center gap-3">
        <span className={clsx("flex h-10 w-10 items-center justify-center rounded-xl", accent.icon)}>
          <Icon className="h-5 w-5" />
        </span>
        <h4 className="text-base font-bold text-ink-950">{alternativa.nombre}</h4>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-ink-800/50">Ahorro mensual</p>
          <p className="text-lg font-bold text-ink-950">
            {formatCOP(alternativa.ahorroMensualEstimado)}
          </p>
        </div>
        <div>
          <p className="text-xs text-ink-800/50">Ahorro en %</p>
          <p className={clsx("text-lg font-bold", accent.pct)}>
            {alternativa.ahorroPorcentual}%
          </p>
        </div>
        <div>
          <p className="text-xs text-ink-800/50">Inversión estimada</p>
          <p className="text-sm font-semibold text-ink-950">
            {formatCOP(alternativa.inversionEstimadaMin)} –{" "}
            {formatCOP(alternativa.inversionEstimadaMax)}
          </p>
        </div>
        <div>
          <p className="text-xs text-ink-800/50">Retorno de inversión</p>
          <p className="text-sm font-semibold text-ink-950">
            {alternativa.retornoMeses ? `${alternativa.retornoMeses} meses` : "N/D"}
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-1.5 border-t border-black/5 pt-4 text-xs text-ink-800/60">
        {alternativa.idealPara.map((p) => (
          <li key={p}>• {p}</li>
        ))}
      </ul>
    </div>
  );
}
