import { RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCOP, formatNumber } from "@/lib/format";
import type { AnalisisResultado } from "@/lib/savings/types";
import { ResultCard } from "./ResultCard";
import { SavingsCharts } from "./SavingsCharts";
import { FinancingSimulator } from "./FinancingSimulator";

export function ResultsView({
  resultado,
  recomendacion,
  avisoExtraccion,
  onReset,
}: {
  resultado: AnalisisResultado;
  recomendacion: string;
  avisoExtraccion?: string;
  onReset: () => void;
}) {
  const aplicables = resultado.alternativas.filter((a) => a.aplica);
  const mejor = resultado.alternativas.find(
    (a) => a.id === resultado.mejorAlternativaId
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-ink-950">
            Tu plan de ahorro solar
          </h3>
          <p className="mt-1 text-sm text-ink-800/60">
            Basado en {formatNumber(resultado.consumoMensualKwh)} kWh/mes y{" "}
            {formatCOP(resultado.valorPagadoMensual)} de factura mensual.
          </p>
        </div>
        <Button variant="ghost" size="md" onClick={onReset}>
          <RotateCcw className="h-4 w-4" />
          Empezar de nuevo
        </Button>
      </div>

      {avisoExtraccion && (
        <p className="mt-4 rounded-xl border border-sun-500/25 bg-sun-500/8 px-4 py-3 text-xs text-ink-900/70">
          {avisoExtraccion}
        </p>
      )}

      <div className="mt-5 rounded-2xl bg-ink-950 p-6 text-white sm:p-7">
        <div className="flex items-center gap-2 text-sun-300">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">
            Recomendación del agente
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
          {recomendacion}
        </p>

        {aplicables.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 sm:grid-cols-2">
            <div>
              <p className="text-xs text-white/45">Ahorro combinado mensual</p>
              <p className="text-2xl font-bold">
                {formatCOP(resultado.ahorroCombinadoMensual)}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/45">Ahorro combinado sobre tu factura</p>
              <p className="text-2xl font-bold text-sun-300">
                {resultado.ahorroCombinadoPorcentual}%
              </p>
            </div>
          </div>
        )}
      </div>

      {aplicables.length > 0 && <SavingsCharts resultado={resultado} />}

      {aplicables.length > 0 ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {aplicables.map((a) => (
            <ResultCard
              key={a.id}
              alternativa={a}
              destacada={a.id === resultado.mejorAlternativaId}
            />
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-xl border border-black/10 bg-white p-5 text-sm text-ink-800/60">
          Marca si te interesa iluminación exterior o si tienes refrigeración
          que proteger para ver esas alternativas también. Mientras tanto, te
          mostramos el potencial de paneles solares para tu consumo.
        </p>
      )}

      {mejor && <FinancingSimulator mejor={mejor} />}

      <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-black/5 bg-cream-100/70 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-sm text-ink-800/70">
          ¿Quieres una cotización real con un asesor solar humano?
        </p>
        <a href="#contacto">
          <Button size="md">Hablar con un asesor</Button>
        </a>
      </div>
    </div>
  );
}
