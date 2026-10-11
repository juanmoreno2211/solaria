"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import clsx from "clsx";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { StepReceipt, type ReciboFormState } from "./StepReceipt";
import {
  StepProperty,
  negocioCompleto,
  type NegocioFormState,
} from "./StepProperty";
import { ResultsView } from "./ResultsView";
import { LoadingState } from "./LoadingState";
import type { AnalisisResultado } from "@/lib/savings/types";

type Step = "recibo" | "negocio" | "resultado" | "cotizacion";

const PASOS: { key: Step; label: string }[] = [
  { key: "recibo", label: "Tu recibo" },
  { key: "negocio", label: "Tu negocio" },
  { key: "resultado", label: "Tu resultado" },
  { key: "cotizacion", label: "Tu cotización" },
];

const INITIAL_RECIBO: ReciboFormState = {
  fuente: "foto",
  imageFile: null,
  consumoMensualKwh: "",
  valorPagadoMensual: "",
};

const INITIAL_NEGOCIO: NegocioFormState = {
  tipoNegocio: "",
  region: "",
  cargasCriticas: [],
  horario: "",
  fallaLuz: "",
  legalmenteConstituido: "",
};

interface ApiResponse {
  resultado: AnalisisResultado;
  recomendacion: string;
  recomendacionFuente: "ia" | "plantilla";
  avisoExtraccion?: string;
  error?: string;
}

function BarraProgreso({ step }: { step: Step }) {
  const actual = PASOS.findIndex((p) => p.key === step);
  return (
    <ol aria-label="Progreso" className="mb-9 flex items-start">
      {PASOS.map((p, i) => {
        const hecho = i < actual;
        const activo = i === actual;
        return (
          <li
            key={p.key}
            aria-current={activo ? "step" : undefined}
            className="relative flex flex-1 flex-col items-center gap-2 text-center"
          >
            {i > 0 && (
              <span
                aria-hidden
                className={clsx(
                  "absolute top-4 right-1/2 h-px w-full -translate-y-1/2",
                  i <= actual ? "bg-sun-500" : "bg-ink-950/10"
                )}
              />
            )}
            <span
              className={clsx(
                "relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-200",
                hecho && "bg-sun-500 text-white",
                activo && "bg-sun-500 text-white ring-4 ring-sun-500/20",
                !hecho && !activo && "bg-cream-100 text-ink-950/40 ring-1 ring-ink-950/10"
              )}
            >
              {hecho ? <Check className="h-4 w-4" strokeWidth={2.5} /> : i + 1}
            </span>
            <span
              className={clsx(
                "text-[11px] font-semibold leading-tight sm:text-xs",
                activo ? "text-ink-950" : "text-ink-950/40"
              )}
            >
              {p.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function CalculatorSection() {
  const [step, setStep] = useState<Step>("recibo");
  const [recibo, setRecibo] = useState<ReciboFormState>(INITIAL_RECIBO);
  const [negocio, setNegocio] = useState<NegocioFormState>(INITIAL_NEGOCIO);
  const [errorNegocio, setErrorNegocio] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [proveedorElegido, setProveedorElegido] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const primerRender = useRef(true);

  // Al cambiar de paso: llevar la vista al inicio de la calculadora y el foco al título.
  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false;
      return;
    }
    const card = cardRef.current;
    if (!card) return;
    card.scrollIntoView({ behavior: "smooth", block: "start" });
    card.querySelector<HTMLElement>("[data-step-title]")?.focus({ preventScroll: true });
  }, [step, loading]);

  async function handleSubmit() {
    if (!negocioCompleto(negocio)) {
      setErrorNegocio("Elige el tipo de negocio, tu región y cuándo trabajas.");
      return;
    }
    setErrorNegocio(null);
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
    if (negocio.fallaLuz) formData.set("fallaLuz", negocio.fallaLuz);
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

  function handlePedirCotizacion(proveedor: string) {
    setProveedorElegido(proveedor);
    setStep("cotizacion");
  }

  function handleReset() {
    setStep("recibo");
    setRecibo(INITIAL_RECIBO);
    setNegocio(INITIAL_NEGOCIO);
    setData(null);
    setError(null);
    setProveedorElegido(null);
  }

  return (
    <section id="calculadora" className="bg-cream-100/50 py-24 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Calculadora para negocios"
          title="¿Le conviene la energía solar a tu negocio?"
          description="Con tu recibo y unos datos de tu negocio te mostramos cuánto ahorrarías con paneles, cuánto costarían y quién te puede cotizar."
        />

        <div className="relative mx-auto mt-12 max-w-3xl">
          <div
            ref={cardRef}
            className="scroll-mt-24 rounded-xl border border-ink-950/10 bg-white p-6 sm:p-9"
          >
            <BarraProgreso step={step} />

            {error && (
              <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
                error={errorNegocio}
              />
            )}

            {step === "resultado" && data && (
              <ResultsView
                resultado={data.resultado}
                recomendacion={data.recomendacion}
                recomendacionFuente={data.recomendacionFuente}
                avisoExtraccion={data.avisoExtraccion}
                onCambiarDatos={() => setStep("negocio")}
                onPedirCotizacion={handlePedirCotizacion}
                onInteresSinProveedor={() => {}}
              />
            )}

            {step === "cotizacion" && proveedorElegido && (
              <div>
                <h3 data-step-title tabIndex={-1} className="text-lg font-bold text-ink-950 outline-none">
                  Pedir cotización con {proveedorElegido}
                </h3>
                <div className="mt-7 flex items-center justify-between">
                  <Button variant="ghost" onClick={() => setStep("resultado")}>
                    Atrás
                  </Button>
                  <Button variant="ghost" onClick={handleReset}>
                    Empezar de nuevo
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
