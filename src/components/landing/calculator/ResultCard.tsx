import { ExternalLink, SunMedium } from "lucide-react";
import { CountUp } from "@/components/ui/CountUp";
import { formatCOP } from "@/lib/format";
import type { AlternativaResultado } from "@/lib/savings/types";

export function ResultCard({
  alternativa,
}: {
  alternativa: AlternativaResultado;
}) {
  return (
    <div className="relative flex flex-col rounded-xl border border-ink-950/8 bg-white p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sun-500/12 text-sun-600">
          <SunMedium className="h-5 w-5" strokeWidth={2} />
        </span>
        <div>
          <h4 className="text-base font-bold text-ink-950">{alternativa.nombre}</h4>
          <p className="text-xs text-ink-800/50">
            Sistema de ≈{alternativa.kwpRequeridos} kWp, sin baterías
          </p>
        </div>
      </div>

      {alternativa.proveedorRecomendado ? (
        <div className="mt-4 rounded-lg border border-ink-950/10 bg-cream-100/60 px-3.5 py-3">
          <div className="text-xs leading-relaxed text-ink-900/75">
            <p className="font-semibold text-ink-950">
              {alternativa.proveedorRecomendado.producto}
              {alternativa.proveedorRecomendado.marca &&
                ` · ${alternativa.proveedorRecomendado.marca}`}
            </p>
            <p>
              Precio de{" "}
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
          Precio de referencia estimado, no es una cotización de un proveedor.
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
          <p className="text-lg font-bold text-sun-600">
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
