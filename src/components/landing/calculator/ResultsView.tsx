import { BatteryWarning, RotateCcw } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "@/components/ui/CountUp";
import { formatCOP, formatNumber } from "@/lib/format";
import type { AnalisisResultado, Veredicto } from "@/lib/savings/types";
import { ResultCard } from "./ResultCard";
import { SavingsCharts } from "./SavingsCharts";
import { FinancingSimulator } from "./FinancingSimulator";
import { buildWhatsAppLink } from "@/lib/whatsapp";

const VEREDICTO: Record<Veredicto, { titulo: string; color: string }> = {
  conviene: { titulo: "Te conviene pedir cotización", color: "text-leaf-400" },
  comparar: { titulo: "Puede convenirte: compara con calma", color: "text-sun-300" },
  por_ahora_no: { titulo: "Por ahora no te lo recomendamos", color: "text-ember-400" },
  sin_proveedores: { titulo: "Aún no tenemos proveedores en tu zona", color: "text-sun-300" },
};

export function ResultsView({
  resultado,
  recomendacion,
  recomendacionFuente,
  avisoExtraccion,
  onReset,
}: {
  resultado: AnalisisResultado;
  recomendacion: string;
  recomendacionFuente: "ia" | "plantilla";
  avisoExtraccion?: string;
  onReset: () => void;
}) {
  const paneles = resultado.alternativas.find(
    (a) => a.id === resultado.mejorAlternativaId
  );
  const veredicto = VEREDICTO[resultado.veredicto];

  return (
    <Reveal y={16}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-ink-950">
            ¿Le conviene la energía solar a tu negocio?
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
        <span className="text-xs font-semibold uppercase tracking-wide text-white/45">
          {recomendacionFuente === "ia"
            ? "Nuestra recomendación (redactada con IA)"
            : "Nuestra recomendación"}
        </span>
        <p className={clsx("mt-2 text-2xl font-bold", veredicto.color)}>
          {veredicto.titulo}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
          {recomendacion}
        </p>

        {paneles && (
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-5">
            <div>
              <p className="text-xs text-white/45">Ahorro mensual estimado</p>
              <p className="text-2xl font-bold">
                <CountUp
                  value={paneles.ahorroMensualEstimado}
                  format={(v) => formatCOP(Math.round(v))}
                />
              </p>
            </div>
            <div>
              <p className="text-xs text-white/45">Ahorro sobre tu factura</p>
              <p className="text-2xl font-bold text-sun-300">
                <CountUp
                  value={paneles.ahorroPorcentual}
                  format={(v) => `${Math.round(v)}%`}
                />
              </p>
            </div>
          </div>
        )}
      </div>

      <p className="mt-4 flex items-start gap-2.5 rounded-xl border border-black/8 bg-white px-4 py-3 text-sm text-ink-800/75">
        <BatteryWarning className="mt-0.5 h-4 w-4 shrink-0 text-ember-600" />
        Este cálculo estima tu ahorro en la factura. Para tener luz durante un
        corte se necesitan baterías, que suben la inversión.
      </p>

      {paneles && (
        <>
          <div className="mt-6 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
            <ResultCard alternativa={paneles} />
            <SavingsCharts mejor={paneles} />
          </div>
          <FinancingSimulator mejor={paneles} />
        </>
      )}

      <p className="mt-4 text-xs leading-relaxed text-ink-800/45">
        Las cifras son estimaciones con supuestos por validar (precio por kWp,
        tarifa comercial y qué parte de tu consumo es de día). La cifra final
        depende de la cotización de un proveedor.
      </p>

      {resultado.veredicto !== "por_ahora_no" && (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-black/5 bg-cream-100/70 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-sm text-ink-800/70">
            ¿Quieres una cotización real para tu negocio?
          </p>
          <a
            href={buildWhatsAppLink(
              paneles
                ? `¡Hola! Calculé en SolarIA que mi negocio ahorraría ≈${paneles.ahorroPorcentual}% con paneles solares y quiero pedir una cotización.`
                : undefined
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="md">Pedir cotización</Button>
          </a>
        </div>
      )}
    </Reveal>
  );
}
