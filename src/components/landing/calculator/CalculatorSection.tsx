"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import clsx from "clsx";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  StepReceipt,
  corrigioLectura,
  fuenteNumeros,
  reciboInicial,
  type ReciboFormState,
} from "./StepReceipt";
import {
  StepProperty,
  etiquetaHorario,
  etiquetaTipoNegocio,
  negocioCompleto,
  type NegocioFormState,
} from "./StepProperty";
import { PanelResumen, type PasoCalculadora } from "./PanelResumen";
import { ResultsView } from "./ResultsView";
import { GuardarResultado } from "./GuardarResultado";
import { LoadingState } from "./LoadingState";
import { StepQuote } from "./StepQuote";
import type { AnalisisResultado } from "@/lib/savings/types";
import { CONTACTO_SOLARIA_ID, proveedorDelDestino, type DestinoCotizacion } from "@/lib/cotizacion-contacto";
import { cifrasPrincipales } from "@/lib/savings/cifras";
import { registrarEvento } from "@/lib/eventos";
import { regionForDepartment } from "@/lib/geo/regions";
import typography from "./CalculatorTypography.module.css";

type Step = PasoCalculadora;

const PASOS: { key: Step; label: string }[] = [
  { key: "recibo", label: "Tu consumo" },
  { key: "negocio", label: "Tu negocio" },
  { key: "resultado", label: "Tu resultado" },
  { key: "cotizacion", label: "Tu cotización" },
];

const INITIAL_NEGOCIO: NegocioFormState = {
  tipoNegocio: "",
  region: "",
  departamento: "",
  conexion: "",
  zona: "",
  municipio: "",
  potenciaCriticaW: "",
  horasAutonomia: "",
  cargasCriticas: [],
  horario: "",
  fallaLuz: "",
  legalmenteConstituido: "",
};

interface ApiResponse {
  resultado: AnalisisResultado;
  recomendacion: string;
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
              <span className="sm:hidden">{{ recibo: "Consumo", negocio: "Negocio", resultado: "Resultado", cotizacion: "Cotización" }[p.key]}</span>
              <span className="hidden sm:inline">{p.label}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function CalculatorSection({ fotoDisponible }: { fotoDisponible: boolean }) {
  const [step, setStep] = useState<Step>("recibo");
  const anchoCompleto = step === "resultado" || step === "cotizacion";
  const [recibo, setRecibo] = useState<ReciboFormState>(() => reciboInicial(fotoDisponible));
  const [errorRecibo, setErrorRecibo] = useState<string | null>(null);
  const [negocio, setNegocio] = useState<NegocioFormState>(INITIAL_NEGOCIO);
  const [errorNegocio, setErrorNegocio] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [proveedorElegido, setProveedorElegido] = useState<string | null>(null);
  // Plan pedido cuando no es el recomendado ("Cubre más de tu consumo").
  const [planElegido, setPlanElegido] = useState<string | undefined>(undefined);

  const paneles = data?.resultado.alternativas[0];
  const ofertaProveedor = paneles?.ofertas.find((o) => o.id === proveedorElegido);
  const ofertaElegida =
    planElegido && ofertaProveedor?.cubreMas?.plan?.nombre === planElegido
      ? ofertaProveedor.cubreMas
      : ofertaProveedor;
  const proveedorDirectorio = [...(data?.resultado.proveedores ?? []), ...(data?.resultado.proveedoresComunitarios ?? [])]
    .find((p) => p.id === proveedorElegido);
  const destinoCotizacion: DestinoCotizacion | undefined = ofertaElegida
    ? { tipo: "oferta", oferta: ofertaElegida }
    : proveedorDirectorio
      ? { tipo: "consulta", proveedor: proveedorDirectorio }
      : proveedorElegido === CONTACTO_SOLARIA_ID ? { tipo: "consulta" } : undefined;


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
    const region = regionForDepartment(negocio.departamento);
    if (!region) {
      setErrorNegocio("Elige el departamento donde está tu negocio.");
      return;
    }
    if (!negocioCompleto(negocio)) {
      setErrorNegocio("Elige el tipo de negocio, el horario y cómo llega la energía.");
      return;
    }
    if (negocio.conexion === "sin_red" && !(Number(recibo.consumoMensualKwh) > 0)) {
      setRecibo((v) => ({ ...v, fuente: "manual" }));
      setErrorRecibo("Sin red, ingresa el consumo mensual estimado en kWh. El valor de una compra de combustible no sirve para inferirlo con una tarifa urbana.");
      setStep("recibo");
      return;
    }
    setErrorNegocio(null);
    setLoading(true);
    setError(null);

    const formData = new FormData();
    // Solo números confirmados; la foto ya se leyó en el paso 1 y no se reenvía.
    formData.set("fuente", fuenteNumeros(recibo));
    if (recibo.consumoMensualKwh)
      formData.set("consumoMensualKwh", recibo.consumoMensualKwh);
    if (recibo.valorPagadoMensual)
      formData.set("valorPagadoMensual", recibo.valorPagadoMensual);

    formData.set("tipoNegocio", negocio.tipoNegocio);
    // El servidor calcula con el departamento y deduce la región.
    formData.set("departamento", negocio.departamento);
    formData.set("region", region);
    for (const c of negocio.cargasCriticas) formData.append("cargasCriticas", c);
    formData.set("horario", negocio.horario);
    formData.set("conexion", negocio.conexion);
    if (negocio.zona) formData.set("zona", negocio.zona);
    if (negocio.municipio) formData.set("municipio", negocio.municipio);
    if (negocio.conexion === "sin_red" || negocio.conexion === "intermitente") {
      if (negocio.potenciaCriticaW) formData.set("potenciaCriticaW", negocio.potenciaCriticaW);
      if (negocio.horasAutonomia) formData.set("horasAutonomia", negocio.horasAutonomia);
    }
    if (negocio.fallaLuz) formData.set("fallaLuz", negocio.fallaLuz);
    if (negocio.legalmenteConstituido)
      formData.set("legalmenteConstituido", negocio.legalmenteConstituido);
    for (const [key, value] of Object.entries(negocio.finanzas ?? {})) {
      if (typeof value === "boolean") formData.set(`finanzas.${key}`, value ? "1" : "0");
      else if (value?.trim()) formData.set(`finanzas.${key}`, value);
    }
    // Indicador solo para desarrollo (el servidor lo ignora en producción).
    if (new URLSearchParams(window.location.search).get("simulados") === "1")
      formData.set("simulados", "1");

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
      const p = json.resultado.alternativas[0];
      registrarEvento("resultado_visto", {
        region: negocio.region,
        departamento: negocio.departamento || null,
        tipoNegocio: negocio.tipoNegocio,
        veredicto: json.resultado.veredicto,
        kwp: p?.kwpRequeridos,
        ahorroMensual: p?.ahorroMensualEstimado,
        proveedor: p?.mejorOferta?.proveedor ?? null,
        retornoMeses: p?.retornoMeses ?? null,
      });
    } catch {
      setError("No pudimos conectar con el servidor. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  function handlePedirCotizacion(ofertaId: string, plan?: string) {
    const oferta = paneles?.ofertas.find((o) => o.id === ofertaId);
    const proveedor = [...(data?.resultado.proveedores ?? []), ...(data?.resultado.proveedoresComunitarios ?? [])].find((p) => p.id === ofertaId);
    if (!oferta && !proveedor && ofertaId !== CONTACTO_SOLARIA_ID) return;
    setProveedorElegido(ofertaId);
    setPlanElegido(plan);
    setStep("cotizacion");
    registrarEvento("clic_pedir_cotizacion", {
      proveedor: oferta?.proveedor ?? proveedor?.nombre ?? "Orientación SolarIA",
      oferta: oferta?.tipoOferta ?? "consulta",
      plan: plan ?? null,
      region: negocio.region,
      veredicto: data?.resultado.veredicto,
    });
  }

  function handleReciboListo() {
    registrarEvento("recibo_ingresado", {
      fuente: fuenteNumeros(recibo),
      consumoKwh: Number(recibo.consumoMensualKwh) || null,
      valorFactura: Number(recibo.valorPagadoMensual) || null,
    });
    registrarEvento("recibo_leido", {
      fuente: fuenteNumeros(recibo),
      corrigio: corrigioLectura(recibo),
    });
    setStep("negocio");
  }

  function handleInteresSinProveedor() {
    registrarEvento("interes_sin_proveedor", {
      region: negocio.region,
      departamento: negocio.departamento || null,
      tipoNegocio: negocio.tipoNegocio,
      kwp: paneles?.kwpRequeridos,
    });
  }

  /** El enlace solo se abre cuando la persona decide contactar al agente. */
  function handleAbrirWhatsApp(ref: string) {
    if (!destinoCotizacion) return;
    const oferta = destinoCotizacion.tipo === "oferta" ? destinoCotizacion.oferta : undefined;
    registrarEvento("whatsapp_abierto", {
      ref,
      proveedor: proveedorDelDestino(destinoCotizacion) ?? "Orientación SolarIA",
      oferta: oferta?.tipoOferta ?? "consulta",
      plan: oferta?.plan?.nombre ?? null,
      region: negocio.region,
      departamento: negocio.departamento || null,
      tipoNegocio: negocio.tipoNegocio,
      ahorroMensual: oferta ? Math.round(oferta.ahorroMensual) : null,
      inversion: oferta ? Math.round(oferta.inversion) : null,
      retornoMeses: oferta?.retornoMeses != null ? Math.round(oferta.retornoMeses) : null,
    });
  }

  function handleReset() {
    setStep("recibo");
    setRecibo(reciboInicial(fotoDisponible));
    setErrorRecibo(null);
    setNegocio(INITIAL_NEGOCIO);
    setData(null);
    setError(null);
    setProveedorElegido(null);
    setPlanElegido(undefined);
  }

  return (
    <section id="calculadora" className={`${typography.calculator} bg-cream-100/50 py-24 sm:py-28`}>
      <Container>
        <SectionHeading
          eyebrow="Calculadora para negocios"
          title="Calcula tu potencial solar"
          description="Puedes volver y cambiar tus respuestas en cualquier momento."
        />

        {/* En el resultado y en WhatsApp no hay columna lateral: la tarjeta usa todo el ancho. */}
        <div
          className={clsx(
            "relative mx-auto mt-12 grid gap-6 lg:items-start",
            !anchoCompleto && "lg:grid-cols-[minmax(0,1fr)_300px]"
          )}
        >
          <div className={anchoCompleto ? "hidden" : "lg:order-2"}>
            <PanelResumen
              step={step}
              recibo={recibo}
              negocio={negocio}
              resultado={data?.resultado ?? null}
            />
          </div>
          <div
            ref={cardRef}
            className="min-w-0 scroll-mt-24 rounded-xl border border-ink-950/10 bg-white p-4 sm:p-9"
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
                onNext={handleReciboListo}
                fotoDisponible={fotoDisponible}
                error={errorRecibo}
                onError={setErrorRecibo}
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
                horario={etiquetaHorario(negocio.horario)}
                onCambiarDatos={() => setStep("negocio")}
                onPedirCotizacion={handlePedirCotizacion}
                onInteresSinProveedor={handleInteresSinProveedor}
              />
            )}
            {step === "resultado" && data && (
              <GuardarResultado
                datos={{
                  consumoKwh: Number(recibo.consumoMensualKwh) || null,
                  valor: Number(recibo.valorPagadoMensual) || null,
                  tipoNegocio: negocio.tipoNegocio,
                  departamento: negocio.departamento,
                  municipio: negocio.municipio || undefined,
                  horario: negocio.horario,
                  conexion: negocio.conexion,
                  veredicto: data.resultado.veredicto,
                  kwp: paneles?.kwpRequeridos ?? null,
                  ahorroMensual: paneles?.ahorroMensualEstimado ?? null,
                  retornoMeses: paneles?.retornoMeses ?? null,
                }}
              />
            )}

            {step === "cotizacion" && destinoCotizacion && data && paneles && (
              <StepQuote
                key={`${proveedorElegido}-${planElegido ?? ""}`}
                destino={destinoCotizacion}
                datos={{
                  departamento: negocio.departamento,
                  municipio: negocio.municipio || undefined,
                  conexion: { estable: "red estable", intermitente: "red con cortes", sin_red: "sin conexión a red", no_se: "por confirmar" }[negocio.conexion || "no_se"],
                  zona: negocio.zona || undefined,
                  tipoNegocio: etiquetaTipoNegocio(negocio.tipoNegocio),
                  horario: etiquetaHorario(negocio.horario),
                  consumoKwh: data.resultado.consumoMensualKwh,
                  valorFactura: data.resultado.valorPagadoMensual,
                  kwp: ofertaElegida?.plan?.kwp ?? data.resultado.energia?.potenciaSolarBaseKwp ?? paneles.kwpRequeridos,
                  energia: data.resultado.energia,
                  presupuestoFinanciero: paneles.finanzas,
                  valorFacturaEstimado: data.resultado.valorEstimado,
                  referenciaEconomica: paneles.finanzas?.proyeccion || !data.resultado.energia?.requiereEstudio ? cifrasPrincipales(paneles) : undefined,
                }}
                onBack={() => setStep("resultado")}
                onReset={handleReset}
                onAbrirWhatsApp={handleAbrirWhatsApp}
              />
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}