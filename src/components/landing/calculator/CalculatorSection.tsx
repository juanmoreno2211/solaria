"use client";

import { useState } from "react";
import { FileScan, Store, Calculator } from "lucide-react";
import clsx from "clsx";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StepReceipt, type ReciboFormState } from "./StepReceipt";
import { StepProperty, type NegocioFormState } from "./StepProperty";
import { ResultsView } from "./ResultsView";
import { LoadingState } from "./LoadingState";
import type { AnalisisResultado } from "@/lib/savings/types";

type Step = "recibo" | "negocio" | "resultado";

const PASOS = [
  { key: "recibo" as const, label: "Tu recibo", icon: FileScan },
  { key: "negocio" as const, label: "Tu negocio", icon: Store },
  { key: "resultado" as const, label: "Resultado", icon: Calculator },
];

const INITIAL_RECIBO: ReciboFormState = {
  fuente: "foto",
  imageFile: null,
  consumoMensualKwh: "",
  valorPagadoMensual: "",
};

const INITIAL_NEGOCIO: NegocioFormState = {
  tipoNegocio: "tienda",
  region: "andina",
  cargasCriticas: [],
  horario: "dia",
  fallaLuz: "cortes",
  legalmenteConstituido: "",
};

interface ApiResponse {
  resultado: AnalisisResultado;
  recomendacion: string;
  recomendacionFuente: "ia" | "plantilla";
  avisoExtraccion?: string;
  error?: string;
}

export function CalculatorSection() {
  const [step, setStep] = useState<Step>("recibo");
  const [recibo, setRecibo] = useState<ReciboFormState>(INITIAL_RECIBO);
  const [negocio, setNegocio] = useState<NegocioFormState>(INITIAL_NEGOCIO);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("fuente", recibo.fuente);
    if (recibo.imageFile) formData.set("recibo", recibo.imageFile);
    if (recibo.consumoMensualKwh)
      formData.set("consumoMensualKwh", recibo.consumoMensualKwh);
    if (recibo.valorPagadoMensual)
      formData.set("valorPagadoMensual", recibo.valorPagadoMensual);

    formData.set("tipoNegocio", negocio.tipoNegocio);
    formData.set("region", negocio.region);
    for (const c of negocio.cargasCriticas) formData.append("cargasCriticas", c);
    formData.set("horario", negocio.horario);
    formData.set("fallaLuz", negocio.fallaLuz);
    if (negocio.legalmenteConstituido)
      formData.set("legalmenteConstituido", negocio.legalmenteConstituido);

    try {
      const res = await fetch("/api/analizar", {
        method: "POST",
        body: formData,
      });
      const json: ApiResponse = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Ocurrió un error al analizar tu información.");
        return;
      }

      setData(json);
      setStep("resultado");
    } catch {
      setError("No pudimos conectar con el servidor. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setStep("recibo");
    setRecibo(INITIAL_RECIBO);
    setNegocio(INITIAL_NEGOCIO);
    setData(null);
    setError(null);
  }

  return (
    <section id="calculadora" className="bg-cream-100/50 py-24 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Calculadora para negocios"
          title="¿Le conviene la energía solar a tu negocio?"
          description="Con tu recibo y unos datos de tu negocio te mostramos cuánto ahorrarías con paneles, cuánto costarían y en cuánto tiempo recuperas la inversión."
        />

        <div className="relative mx-auto mt-12 max-w-3xl">
          <div className="rounded-xl border border-ink-950/10 bg-white p-6 sm:p-9">
            {step !== "resultado" && (
                <div className="mb-9 flex items-center">
                  {PASOS.slice(0, 2).map((p, i) => {
                    const activo = step === p.key;
                    const completado =
                      PASOS.findIndex((x) => x.key === step) > i;
                    return (
                      <div key={p.key} className="flex flex-1 items-center last:flex-none">
                        <div className="flex flex-col items-center gap-2">
                          <span
                            className={clsx(
                              "flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200",
                              activo || completado
                                ? "bg-sun-500 text-white"
                                : "bg-ink-950/8 text-ink-950/35"
                            )}
                          >
                            <p.icon className="h-4 w-4" strokeWidth={2} />
                          </span>
                          <span
                            className={clsx(
                              "text-[11px] font-semibold uppercase tracking-wide",
                              activo ? "text-ink-950" : "text-ink-950/35"
                            )}
                          >
                            {p.label}
                          </span>
                        </div>
                        {i === 0 && (
                          <span className="mx-3 mb-5 h-px flex-1 overflow-hidden bg-ink-950/8">
                            <span
                              className={clsx(
                                "block h-full bg-sun-500 transition-all duration-500 ease-out",
                                step === "negocio" ? "w-full" : "w-0"
                              )}
                            />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {error && (
                <p className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              {step === "recibo" && (
                <StepReceipt
                  value={recibo}
                  onChange={setRecibo}
                  onNext={() => setStep("negocio")}
                />
              )}

              {step === "negocio" && loading && <LoadingState />}

              {step === "negocio" && !loading && (
                <StepProperty
                  value={negocio}
                  onChange={setNegocio}
                  onBack={() => setStep("recibo")}
                  onSubmit={handleSubmit}
                  loading={loading}
                />
              )}

              {step === "resultado" && data && (
                <ResultsView
                  resultado={data.resultado}
                  recomendacion={data.recomendacion}
                  recomendacionFuente={data.recomendacionFuente}
                  avisoExtraccion={data.avisoExtraccion}
                  onReset={handleReset}
                />
              )}
          </div>
        </div>
      </Container>
    </section>
  );
}
