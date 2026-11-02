"use client";

import { AlertTriangle, Check, Clock, MapPin, ReceiptText, Store, Zap } from "lucide-react";
import clsx from "clsx";
import { IlustracionSolar } from "./IlustracionSolar";
import { Desplegable } from "./Desplegable";
import { etiquetaHorario, etiquetaTipoNegocio, type NegocioFormState } from "./StepProperty";
import type { ReciboFormState } from "./StepReceipt";
import { hspParaCalculo } from "@/lib/geo/departamentos";
import { TARIFA_COMERCIAL_COP_KWH } from "@/lib/config/pricing";
import { formatCOP, formatDecimal, formatNumber } from "@/lib/format";
import type { AnalisisResultado } from "@/lib/savings/types";

export type PasoCalculadora = "recibo" | "negocio" | "resultado" | "cotizacion";

const FRASES: Record<PasoCalculadora, { titulo: string; texto: string }> = {
  recibo: {
    titulo: "Empecemos por tu recibo de luz",
    texto: "Usa el recibo más reciente que tengas a mano.",
  },
  negocio: {
    titulo: "Ahora, tu negocio",
    texto: "Llena los datos a continuación.",
  },
  resultado: {
    titulo: "Esto podrías ahorrar",
    texto: "Elige un proveedor para cotizar o mira cómo hicimos la cuenta.",
  },
  cotizacion: {
    titulo: "Último paso: escríbenos",
    texto: "Un agente de SolarIA te acompaña por WhatsApp hasta la visita técnica.",
  },
};

/**
 * Precio por kWh fuera de lo normal: suele ser un número mal copiado o un
 * valor que incluye aseo. Rango amplio alrededor de la tarifa comercial de referencia.
 */
const TARIFA_MIN = Math.round(TARIFA_COMERCIAL_COP_KWH * 0.4);
const TARIFA_MAX = Math.round(TARIFA_COMERCIAL_COP_KWH * 2.2);

interface Fila {
  label: string;
  valor?: string;
  Icono: typeof Zap;
}

function filasResumen(
  recibo: ReciboFormState,
  negocio: NegocioFormState,
  resultado: AnalisisResultado | null
): Fila[] {
  const consumo = resultado?.consumoMensualKwh ?? (Number(recibo.consumoMensualKwh) || 0);
  const factura = resultado?.valorPagadoMensual ?? (Number(recibo.valorPagadoMensual) || 0);
  const hsp = resultado?.ubicacion.hsp ?? hspParaCalculo(negocio.departamento);

  return [
    {
      label: "Consumo",
      valor: consumo > 0 ? `${formatNumber(Math.round(consumo))} kWh/mes` : undefined,
      Icono: Zap,
    },
    {
      label: "Energía del mes",
      valor: factura > 0 ? formatCOP(Math.round(factura)) : undefined,
      Icono: ReceiptText,
    },
    {
      label: "Ubicación",
      valor: negocio.departamento
        ? `${negocio.departamento}${hsp !== undefined ? `, ${formatDecimal(hsp)} h de sol` : ""}`
        : undefined,
      Icono: MapPin,
    },
    { label: "Negocio", valor: etiquetaTipoNegocio(negocio.tipoNegocio), Icono: Store },
    { label: "Horario", valor: etiquetaHorario(negocio.horario), Icono: Clock },
  ];
}

function ListaResumen({ filas }: { filas: Fila[] }) {
  return (
    <ul className="space-y-1">
      {filas.map((f) => {
        const lista = Boolean(f.valor);
        return (
          <li key={f.label} className="flex items-center gap-3 py-1">
            <span
              className={clsx(
                "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
                lista ? "bg-sun-500/12 text-sun-600" : "bg-ink-950/[0.04] text-ink-950/25"
              )}
            >
              <f.Icono className="h-4 w-4" strokeWidth={1.75} />
              {lista && (
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-leaf-500 text-white ring-2 ring-white">
                  <Check className="h-2 w-2" strokeWidth={4} />
                </span>
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] text-ink-800/50">{f.label}</span>
              <span
                className={clsx(
                  "block truncate text-sm",
                  lista ? "font-semibold text-ink-950 tabular-nums" : "text-ink-950/30"
                )}
              >
                {f.valor ?? "—"}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** Cuánto paga por kWh, calculado en vivo; avisa si el número parece mal copiado. */
function PrecioKwh({ recibo, resultado }: { recibo: ReciboFormState; resultado: AnalisisResultado | null }) {
  const consumo = resultado?.consumoMensualKwh ?? (Number(recibo.consumoMensualKwh) || 0);
  const factura = resultado?.valorPagadoMensual ?? (Number(recibo.valorPagadoMensual) || 0);

  if (!(consumo > 0 && factura > 0)) {
    return (
      <div className="rounded-lg border border-dashed border-ink-950/12 p-3.5 text-xs leading-relaxed text-ink-800/50">
        Con el consumo y el valor de la energía calculamos cuánto pagas por cada kWh.
      </div>
    );
  }

  const tarifa = Math.round(factura / consumo);
  const raro = tarifa < TARIFA_MIN || tarifa > TARIFA_MAX;

  return (
    <div
      aria-live="polite"
      className={clsx("rounded-lg p-3.5", raro ? "bg-ember-500/10 ring-1 ring-ember-500/30" : "bg-cream-100")}
    >
      <p className="text-[11px] text-ink-800/55">Pagas por cada kWh</p>
      <p className="mt-0.5 text-base font-semibold tracking-[-0.03em] text-ink-850 tabular-nums"> {formatCOP(tarifa)} </p>
      {raro ? (
        <p className="mt-1.5 flex gap-1.5 text-xs leading-relaxed text-ember-600">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {tarifa < TARIFA_MIN
            ? "Es muy poco para un recibo de energía. Revisa que el consumo y el valor sean del mismo mes."
            : "Es mucho para un recibo de energía. ¿Incluiste aseo u otros cobros en el valor?"}
        </p>
      ) : null} </div>
  );
}

/**
 * Columna lateral: ilustración, en qué paso va el usuario y lo que ya respondió.
 * En el celular se vuelve una tarjeta compacta con el resumen plegable.
 */
export function PanelResumen({
  step,
  recibo,
  negocio,
  resultado,
}: {
  step: PasoCalculadora;
  recibo: ReciboFormState;
  negocio: NegocioFormState;
  resultado: AnalisisResultado | null;
}) {
  const frase = FRASES[step];
  const filas = filasResumen(recibo, negocio, resultado);
  const respondidas = filas.filter((f) => f.valor).length;

  return (
    <aside aria-label="Tus datos" className="flex flex-col gap-4 lg:sticky lg:top-24">
      {/* Celular: tarjeta compacta con la ilustración y la frase del paso */}
      <div className="flex items-center gap-4 rounded-xl border border-ink-950/10 bg-cream-100/80 p-4 lg:hidden">
        <IlustracionSolar className="h-auto w-28 shrink-0 sm:w-36" />
        <div className="min-w-0">
          <p className="text-base font-semibold leading-snug tracking-[-0.02em] text-ink-950">
            {frase.titulo}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-800/60">{frase.texto}</p>
        </div>
      </div>

      {/* Pantallas grandes: una sola tarjeta con ilustración, frase, datos y precio por kWh */}
      <div className="hidden overflow-hidden rounded-xl border border-ink-950/10 bg-white lg:block">
        <div className="bg-cream-100/80 pt-2">
          <IlustracionSolar className="mx-auto h-36 w-auto" />
        </div>
        <div className="p-5">
          <p className="text-base font-semibold leading-snug tracking-[-0.02em] text-ink-950">
            {frase.titulo}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-800/60">{frase.texto}</p>

          <div className="mt-5 border-t border-ink-950/8 pt-4">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-semibold text-ink-950">Tus datos</p>
              <p className="text-xs tabular-nums text-ink-800/50">
                {respondidas} de {filas.length}
              </p>
            </div>
            <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-ink-950/[0.06]">
              <div
                className="h-full rounded-full bg-sun-500 transition-[width] duration-500 ease-out"
                style={{ width: `${(respondidas / filas.length) * 100}%` }}
              />
            </div>
            <div className="mt-3">
              <ListaResumen filas={filas} />
            </div>
          </div>

          <div className="mt-4">
            <PrecioKwh recibo={recibo} resultado={resultado} />
          </div>
        </div>
      </div>

      {respondidas > 0 && (
        <Desplegable
          titulo="Tus datos"
          resumen={`${respondidas} de ${filas.length} respondidos`}
          className="lg:hidden"
        >
          <ListaResumen filas={filas} />
          <div className="mt-3">
            <PrecioKwh recibo={recibo} resultado={resultado} />
          </div>
        </Desplegable>
      )}
    </aside>
  );
}