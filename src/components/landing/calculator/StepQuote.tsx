"use client";

import { CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ErroresSolicitante } from "@/lib/cotizacion";
import type { OfertaProveedor } from "@/lib/savings/types";
import { CotizacionForm, type CotizacionFormState } from "./CotizacionForm";

const PASOS_SIGUIENTES = [
  "El proveedor recibe tu solicitud con el resumen de tu negocio.",
  "Te escribe por WhatsApp para confirmar los datos.",
  "Te pide una foto del techo y de tu recibo, y programa una visita.",
  "Te entrega una propuesta con el precio final y las condiciones.",
];

export function StepQuote({
  oferta,
  value,
  onChange,
  errores,
  errorEnvio,
  enviando,
  enviada,
  onBack,
  onSubmit,
  onReset,
}: {
  oferta: OfertaProveedor;
  value: CotizacionFormState;
  onChange: (v: CotizacionFormState) => void;
  errores: ErroresSolicitante;
  errorEnvio: string | null;
  enviando: boolean;
  enviada: boolean;
  onBack: () => void;
  onSubmit: () => void;
  onReset: () => void;
}) {
  if (enviada) {
    return (
      <div>
        <h3
          data-step-title
          tabIndex={-1}
          className="flex items-center gap-2 text-lg font-bold text-ink-950 outline-none"
        >
          <CheckCircle2 className="h-5 w-5 text-leaf-600" />
          Cotización pedida
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-800/70">
          {oferta.estadoDatos === "simulado"
            ? "En esta versión de prueba tu solicitud no llega a una empresa: la recibe el equipo de SolarIA, que la pasará a un instalador."
            : oferta.estadoDatos === "referencial"
              ? `Tu solicitud la recibe el equipo de SolarIA, que se la pasará a ${oferta.proveedor} con tu autorización.`
              : `Tu solicitud le llegó a ${oferta.proveedor} con tu estimado ya calculado.`}
        </p>

        <div className="mt-6 rounded-xl border border-ink-950/8 bg-cream-100/60 p-5">
          <p className="text-sm font-semibold text-ink-950">Lo que pasa ahora (ejemplo)</p>
          <ol className="mt-3 space-y-2.5">
            {PASOS_SIGUIENTES.map((paso, i) => (
              <li key={paso} className="flex gap-3 text-sm text-ink-800/75">
                <span className="tabular-nums font-semibold text-sun-600">{i + 1}.</span>
                {paso}
              </li>
            ))}
          </ol>
          <p className="mt-4 border-t border-ink-950/8 pt-3 text-sm text-ink-800/70">
            A los 3 días te escribimos con tu cifra de ahorro.
          </p>
        </div>

        <div className="mt-7">
          <Button variant="ghost" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
            Empezar de nuevo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 data-step-title tabIndex={-1} className="text-lg font-bold text-ink-950 outline-none">
        Pedir cotización con {oferta.proveedor}
        {oferta.plan && `: ${oferta.plan.nombre}`}
      </h3>
      <p className="mt-1 text-sm text-ink-800/60">
        {oferta.estadoDatos !== "confirmado"
          ? "Enviaremos tus datos y tu estimado de ahorro al equipo de SolarIA para que no tengas que explicar todo desde cero."
          : `Le enviaremos tus datos y tu estimado de ahorro a ${oferta.proveedor} para que no tengas que explicar todo desde cero.`}
      </p>
      <div className="mt-6">
        <CotizacionForm
          proveedor={oferta.proveedor}
          estadoDatos={oferta.estadoDatos}
          value={value}
          onChange={onChange}
          errores={errores}
          errorEnvio={errorEnvio}
          enviando={enviando}
          onBack={onBack}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}
