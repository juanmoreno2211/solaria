import { BadgeCheck, ExternalLink, Lightbulb, Snowflake, SunMedium } from "lucide-react";
import clsx from "clsx";
import { CountUp } from "@/components/ui/CountUp";
import { formatCOP } from "@/lib/format";
import type { AlternativaResultado } from "@/lib/savings/types";

const ICONS = {
  paneles: SunMedium,
  iluminacion: Lightbulb,
  refrigeracion: Snowflake,
};

const ACCENTS = {
  paneles: {
    icon: "bg-sun-500/12 text-sun-600",
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
        "relative flex flex-col rounded-xl border bg-white p-6",
        destacada ? clsx("border-2", accent.ring) : "border-ink-950/8"
      )}
    >
      {destacada && (
        <span className="absolute -top-3 left-6 rounded-md bg-ink-950 px-2.5 py-1 text-[11px] font-semibold text-white">
          Recomendado para ti
        </span>
      )}

      <div className="flex items-center gap-3">
        <span className={clsx("flex h-10 w-10 items-center justify-center rounded-lg", accent.icon)}>
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
        <h4 className="text-base font-bold text-ink-950">{alternativa.nombre}</h4>
      </div>

      {alternativa.proveedorRecomendado ? (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-leaf-500/25 bg-leaf-500/6 px-3.5 py-3">
          <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-leaf-600" />
          <div className="text-xs leading-relaxed text-ink-900/75">
            <p className="font-semibold text-ink-950">
              {alternativa.proveedorRecomendado.producto}
              {alternativa.proveedorRecomendado.marca &&
                ` · ${alternativa.proveedorRecomendado.marca}`}
            </p>
            <p>
              Cotización real de{" "}
              <span className="font-medium">
                {alternativa.proveedorRecomendado.proveedor}
              </span>
              {alternativa.proveedorRecomendado.url && (
                <a
                  href={alternativa.proveedorRecomendado.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 inline-flex items-center gap-0.5 font-medium text-leaf-700 hover:underline"
                >
                  ver ficha <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-xs text-ink-800/40">
          Precio de referencia del mercado (aún sin proveedor cotizado para tu zona).
        </p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-ink-800/50">Ahorro mensual</p>
          <p className="text-lg font-bold text-ink-950">
            <CountUp
              value={alternativa.ahorroMensualEstimado}
              format={(v) => formatCOP(Math.round(v))}
            />
          </p>
        </div>
        <div>
          <p className="text-xs text-ink-800/50">Ahorro en %</p>
          <p className={clsx("text-lg font-bold", accent.pct)}>
            <CountUp
              value={alternativa.ahorroPorcentual}
              format={(v) => `${Math.round(v)}%`}
            />
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
