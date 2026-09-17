"use client";

import { useState } from "react";
import { FileScan, ClipboardList, Sparkles } from "lucide-react";
import clsx from "clsx";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StepReceipt, type ReciboFormState } from "./StepReceipt";
import { StepProperty, type PredioFormState } from "./StepProperty";
import { ResultsView } from "./ResultsView";
import { LoadingState } from "./LoadingState";
import type { AnalisisResultado } from "@/lib/savings/types";

type Step = "recibo" | "predio" | "resultado";

const PASOS = [
  { key: "recibo" as const, label: "Tu recibo", icon: FileScan },
  { key: "predio" as const, label: "Tu predio", icon: ClipboardList },
  { key: "resultado" as const, label: "Resultado", icon: Sparkles },
];

const INITIAL_RECIBO: ReciboFormState = {
  fuente: "foto",
  imageFile: null,
  consumoMensualKwh: "",
  valorPagadoMensual: "",
};

const INITIAL_PREDIO: PredioFormState = {
  tipoPredio: "casa",
  estrato: 3,
  esComercialOIndustrial: "comercial",
  region: "andina",
  conexionRed: "interconectado",
  tieneRefrigeracionCritica: false,
  tamanoRefrigeracion: "media",
  interesIluminacionExterior: false,
  puntosIluminacionAprox: "",
};

interface ApiResponse {
  resultado: AnalisisResultado;
  recomendacion: string;
  avisoExtraccion?: string;
  error?: string;
}

export function CalculatorSection() {
  const [step, setStep] = useState<Step>("recibo");
  const [recibo, setRecibo] = useState<ReciboFormState>(INITIAL_RECIBO);
  const [predio, setPredio] = useState<PredioFormState>(INITIAL_PREDIO);
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

    formData.set("tipoPredio", predio.tipoPredio);
    formData.set("estrato", String(predio.estrato));
    formData.set("esComercialOIndustrial", predio.esComercialOIndustrial);
    formData.set("region", predio.region);
    formData.set("conexionRed", predio.conexionRed);
    formData.set(
      "tieneRefrigeracionCritica",
      String(predio.tieneRefrigeracionCritica)
    );
    formData.set("tamanoRefrigeracion", predio.tamanoRefrigeracion);
    formData.set(
      "interesIluminacionExterior",
      String(predio.interesIluminacionExterior)
    );
    if (predio.puntosIluminacionAprox)
      formData.set("puntosIluminacionAprox", predio.puntosIluminacionAprox);

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
      setError("No pudimos conectar con el agente. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setStep("recibo");
    setRecibo(INITIAL_RECIBO);
    setPredio(INITIAL_PREDIO);
    setData(null);
    setError(null);
  }

  return (
    <section id="calculadora" className="bg-cream-100/50 py-24 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Calculadora con IA"
          title="Calcula tu ahorro solar en minutos"
          description="Completa estos pasos y el agente te mostrará el ahorro estimado en porcentaje, dinero y tiempo de retorno."
        />

        <div className="relative mx-auto mt-12 max-w-3xl">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-8 -inset-y-6 -z-10 rounded-[40px] bg-gradient-to-br from-sun-500/20 via-ember-500/10 to-leaf-500/20 blur-2xl"
          />
          <div className="rounded-[28px] bg-gradient-to-br from-sun-500/50 via-ember-500/30 to-leaf-500/40 p-[1.5px] shadow-[0_30px_60px_-30px_rgba(20,17,12,0.35)]">
            <div className="rounded-[26.5px] bg-white/90 p-6 backdrop-blur-sm sm:p-9">
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
                              "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300",
                              activo || completado
                                ? "bg-sun-gradient text-ink-950 shadow-[0_6px_18px_-6px_rgba(245,158,11,0.7)]"
                                : "bg-black/8 text-ink-800/40"
                            )}
                          >
                            <p.icon className="h-4 w-4" strokeWidth={2.25} />
                          </span>
                          <span
                            className={clsx(
                              "text-[11px] font-semibold uppercase tracking-wide",
                              activo ? "text-ink-950" : "text-ink-800/40"
                            )}
                          >
                            {p.label}
                          </span>
                        </div>
                        {i === 0 && (
                          <span className="mx-3 mb-5 h-0.5 flex-1 overflow-hidden rounded-full bg-black/8">
                            <span
                              className={clsx(
                                "block h-full rounded-full bg-sun-gradient transition-all duration-500 ease-out",
                                step === "predio" ? "w-full" : "w-0"
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
                <p className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              {step === "recibo" && (
                <StepReceipt
                  value={recibo}
                  onChange={setRecibo}
                  onNext={() => setStep("predio")}
                />
              )}

              {step === "predio" && loading && <LoadingState />}

              {step === "predio" && !loading && (
                <StepProperty
                  value={predio}
                  onChange={setPredio}
                  onBack={() => setStep("recibo")}
                  onSubmit={handleSubmit}
                  loading={loading}
                />
              )}

              {step === "resultado" && data && (
                <ResultsView
                  resultado={data.resultado}
                  recomendacion={data.recomendacion}
                  avisoExtraccion={data.avisoExtraccion}
                  onReset={handleReset}
                />
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
