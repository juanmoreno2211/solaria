"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StepReceipt, type ReciboFormState } from "./StepReceipt";
import { StepProperty, type PredioFormState } from "./StepProperty";
import { ResultsView } from "./ResultsView";
import type { AnalisisResultado } from "@/lib/savings/types";

type Step = "recibo" | "predio" | "resultado";

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

        <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-black/5 bg-white/70 p-6 shadow-[0_1px_0_rgba(0,0,0,0.03)] backdrop-blur-sm sm:p-9">
          {step !== "resultado" && (
            <div className="mb-8 flex items-center gap-2">
              {["recibo", "predio"].map((s, i) => (
                <div key={s} className="flex flex-1 items-center gap-2">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                      step === s
                        ? "bg-sun-gradient text-ink-950"
                        : "bg-black/10 text-ink-800/50"
                    }`}
                  >
                    {i + 1}
                  </span>
                  {i === 0 && <span className="h-px flex-1 bg-black/10" />}
                </div>
              ))}
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

          {step === "predio" && (
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
      </Container>
    </section>
  );
}
