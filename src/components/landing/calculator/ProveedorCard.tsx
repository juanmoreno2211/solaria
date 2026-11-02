"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import type { EstadoDatos } from "@/lib/catalog/types";
import { formatCOPMiles, formatDecimal } from "@/lib/format";
import type { OfertaProveedor } from "@/lib/savings/types";
import { Desplegable } from "./Desplegable";

const ETIQUETA_DATOS: Record<EstadoDatos, string | null> = {
  simulado: "Proveedor de ejemplo",
  referencial: "Precio de referencia, no es una cotización",
  confirmado: null,
};

export function anios(meses: number | null): string {
  return meses === null ? "Sin recuperación en 20 años" : `${formatDecimal(meses / 12)} años`;
}

function Cifra({ label, valor, nota }: { label: string; valor: string; nota?: string }) {
  return (
    <div>
      <dt className="text-[11px] leading-snug text-ink-800/55">{label}</dt>
      <dd className="mt-1 text-base font-semibold tracking-[-0.01em] text-ink-950 tabular-nums">{valor}</dd>
      {nota && <dd className="text-[11px] text-ink-800/45">{nota}</dd>}
    </div>
  );
}

function Fila({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <dt className="text-xs text-ink-800/55">{label}</dt>
      <dd className="text-right text-xs font-semibold text-ink-950">{children}</dd>
    </div>
  );
}

/** Simulación del equipo con la cuota inicial que elija el usuario; no es una oferta. */
function SimulacionPago({
  proveedor,
  simulacion,
}: {
  proveedor: string;
  simulacion: NonNullable<OfertaProveedor["simulacionPago"]>;
}) {
  const [i, setI] = useState(0);
  const pago = simulacion.opciones[i];

  return (
    <div className="mt-3 rounded-lg bg-cream-100/70 p-3">
      <p className="text-xs font-semibold text-ink-950">Si pagas por cuotas</p>
      <p className="mt-1 text-[11px] leading-relaxed text-ink-800/60">
        Simulación con una tasa de {formatDecimal(simulacion.tasaMensual * 100)} % mensual a{" "}
        {simulacion.plazoMeses} meses. No es una oferta de {proveedor}.
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5" role="group" aria-label="Cuota inicial">
        <span className="mr-1 text-[11px] text-ink-800/55">Cuota inicial</span>
        {simulacion.opciones.map((o, j) => (
          <button
            key={o.cuotaInicialPct}
            type="button"
            onClick={() => setI(j)}
            aria-pressed={i === j}
            className={clsx(
              "rounded-md border px-2 py-0.5 text-[11px] font-semibold transition-colors",
              i === j
                ? "border-ink-900 bg-ink-900 text-white"
                : "border-ink-950/10 bg-white text-ink-800/70 hover:border-ink-950/25"
            )}
          >
            {Math.round(o.cuotaInicialPct * 100)} %
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ink-900/80">
        Pagas {formatCOPMiles(pago.cuotaInicial)} al inicio y {formatCOPMiles(pago.cuotaMensual)} al mes.{" "}
        {pago.flujoMensual >= 0
          ? `Con tu ahorro te quedan ${formatCOPMiles(pago.flujoMensual)} libres cada mes.`
          : `Pondrías ${formatCOPMiles(-pago.flujoMensual)} de tu bolsillo cada mes mientras pagas.`}
      </p>
    </div>
  );
}

export function ProveedorCard({
  oferta,
  recomendada,
  menorInversion,
  onElegir,
}: {
  oferta: OfertaProveedor;
  /** Es la oferta con la que se calcularon las cifras principales. */
  recomendada: boolean;
  menorInversion: boolean;
  /** Sin plan: el plan recomendado (o el proveedor, si no vende por planes). */
  onElegir: (plan?: string) => void;
}) {
  const { financiacion: fin, ppa } = oferta;
  const etiquetaDatos = oferta.etiqueta ?? ETIQUETA_DATOS[oferta.estadoDatos];

  if (!oferta.aplica) {
    return (
      <article className="rounded-xl border border-dashed border-ink-950/15 p-4 text-ink-800/60">
        <h5 className="text-sm font-semibold text-ink-950/60">{oferta.titulo}</h5>
        <p className="mt-1 text-xs leading-relaxed">{oferta.motivoNoAplica}</p>
        {oferta.notaCobertura && <p className="mt-1 text-xs">{oferta.notaCobertura}</p>}
      </article>
    );
  }

  return (
    <article
      className={clsx(
        "flex flex-col rounded-xl border bg-white p-4 sm:p-5",
        recomendada ? "border-ink-900" : "border-ink-950/10"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h5 className="text-base font-semibold leading-snug text-ink-950">{oferta.titulo}</h5>
          {recomendada ? (
            <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-leaf-700">
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
              Con esta oferta calculamos tu resultado
            </p>
          ) : (
            menorInversion && <p className="mt-1 text-xs font-semibold text-sun-600">La menor inversión</p>
          )}
          {etiquetaDatos && <p className="mt-1 text-xs text-ink-800/50">{etiquetaDatos}</p>}
        </div>
        {/* El botón ya trae inline-flex: se esconde con un contenedor, no con `hidden`. */}
        <div className="hidden shrink-0 sm:block">
          <Button size="md" onClick={() => onElegir()}>
            Cotizar con {oferta.proveedor}
          </Button>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-3 border-t border-ink-950/8 pt-3">
        {ppa ? (
          <>
            <Cifra label="Inversión" valor={formatCOPMiles(0)} />
            <Cifra label="Pagas por la energía" valor={formatCOPMiles(ppa.pagoMensual)} nota="al mes" />
            <Cifra label="Ahorras" valor={formatCOPMiles(oferta.ahorroMensual)} nota="al mes" />
          </>
        ) : (
          <>
            <Cifra label="Inversión" valor={formatCOPMiles(oferta.inversion)} />
            <Cifra label="Ahorras" valor={formatCOPMiles(oferta.ahorroMensual)} nota="al mes" />
            <Cifra label="Se paga en" valor={anios(oferta.retornoMeses)} />
          </>
        )}
      </dl>

      <Button size="md" className="mt-4 w-full sm:hidden" onClick={() => onElegir()}>
        Cotizar con {oferta.proveedor}
      </Button>

      <Desplegable titulo="Ver detalles de la oferta" variante="plano" className="mt-2">
        <dl className="divide-y divide-ink-950/6">
          {oferta.plan && (
            <Fila label="Plan">
              {oferta.plan.nombre}, {formatDecimal(oferta.plan.kwp)} kW
            </Fila>
          )}
          {!ppa && (
            <Fila label="Rango de inversión">
              {formatCOPMiles(oferta.inversionMin)} a {formatCOPMiles(oferta.inversionMax)}
            </Fila>
          )}
          {ppa && (
            <Fila label="Descuento sobre tu tarifa">{Math.round(ppa.descuentoSobreRed * 100)} %</Fila>
          )}
          {ppa && <Fila label="Contrato">{ppa.contrato ?? "A confirmar"}</Fila>}
          {fin ? (
            <Fila label="Financiación del proveedor">
              {formatCOPMiles(fin.cuotaInicial)} de cuota inicial y {formatCOPMiles(fin.cuotaMensual)} al mes
              durante {fin.plazoMeses} meses
            </Fila>
          ) : (
            oferta.pagoDescripcion && <Fila label="Forma de pago">{oferta.pagoDescripcion}</Fila>
          )}
          {oferta.instalacion && <Fila label="Instalación">{oferta.instalacion}</Fila>}
        </dl>
        {oferta.notaCobertura && (
          <p className="mt-2 text-xs leading-relaxed text-ink-800/60">{oferta.notaCobertura}</p>
        )}
        {oferta.requiereVisitaTecnica && (
          <p className="mt-1 text-xs text-ink-800/60">Requiere una visita técnica antes de instalar.</p>
        )}
        {oferta.simulacionPago && (
          <SimulacionPago proveedor={oferta.proveedor} simulacion={oferta.simulacionPago} />
        )}
        {oferta.cubreMas && (
          <div className="mt-3 rounded-lg border border-ink-950/10 p-3">
            <p className="text-xs leading-relaxed text-ink-900/80">
              También tiene el <b>{oferta.cubreMas.plan?.nombre}</b>
              {oferta.cubreMas.plan && ` (${formatDecimal(oferta.cubreMas.plan.kwp)} kW)`}, que cubre todo
              tu consumo: inversión de {formatCOPMiles(oferta.cubreMas.inversion)}, se paga en{" "}
              {anios(oferta.cubreMas.retornoMeses)}.
            </p>
            <Button
              variant="secondary"
              size="md"
              className="mt-2 w-full"
              onClick={() => onElegir(oferta.cubreMas!.plan?.nombre)}
            >
              Cotizar el {oferta.cubreMas.plan?.nombre}
            </Button>
          </div>
        )}
      </Desplegable>
    </article>
  );
}
