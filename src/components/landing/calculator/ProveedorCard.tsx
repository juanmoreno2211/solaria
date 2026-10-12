"use client";

import { useState } from "react";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import type { EstadoDatos } from "@/lib/catalog/types";
import { formatCOPMiles, formatDecimal } from "@/lib/format";
import type { OfertaProveedor } from "@/lib/savings/types";

const ETIQUETA_DATOS: Record<EstadoDatos, string | null> = {
  simulado: "Proveedor de ejemplo",
  referencial: "Precio de referencia, no es una cotización",
  confirmado: null,
};

function Fila({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="text-xs text-ink-800/55">{label}</dt>
      <dd className="text-right text-sm font-semibold text-ink-950">{children}</dd>
    </div>
  );
}

function Nota({ children }: { children: React.ReactNode }) {
  return <span className="block text-xs font-normal text-ink-800/50">{children}</span>;
}

function Etiqueta({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-ink-950/6 px-2 py-0.5 text-[11px] font-semibold text-ink-900/70">
      {children}
    </span>
  );
}

function Flujo({ valor }: { valor: number }) {
  return (
    <span className={valor >= 0 ? "text-leaf-700" : "text-red-700"}>
      {valor >= 0 ? "+" : "−"}
      {formatCOPMiles(Math.abs(valor))}
    </span>
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
    <div className="mt-4 rounded-lg bg-cream-100/70 p-4">
      <p className="text-xs font-semibold text-ink-950">Simulación de pago</p>
      <p className="mt-1 text-xs leading-relaxed text-ink-800/60">
        Esta es una simulación con tus datos, no una oferta de {proveedor}. Las
        condiciones reales las confirma el proveedor.
      </p>

      <p className="mt-3 text-xs text-ink-800/55">Cuota inicial</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {simulacion.opciones.map((o, j) => (
          <button
            key={o.cuotaInicialPct}
            type="button"
            onClick={() => setI(j)}
            aria-pressed={i === j}
            className={clsx(
              "rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors",
              i === j
                ? "border-sun-500 bg-sun-500/10 text-sun-700"
                : "border-ink-950/10 bg-white text-ink-800/60 hover:border-ink-950/20"
            )}
          >
            {Math.round(o.cuotaInicialPct * 100)} %
          </button>
        ))}
      </div>

      <dl className="mt-2 divide-y divide-ink-950/6">
        <Fila label="Cuota inicial">{formatCOPMiles(pago.cuotaInicial)}</Fila>
        <Fila label="Cuota mensual">
          {formatCOPMiles(pago.cuotaMensual)}
          <Nota>
            durante {pago.plazoMeses} meses, al{" "}
            {formatDecimal(simulacion.tasaMensual * 100)} % mensual
          </Nota>
        </Fila>
        <Fila label="Ahorro menos cuota y mantenimiento">
          <Flujo valor={pago.flujoMensual} />
          <Nota>al mes mientras pagas</Nota>
        </Fila>
      </dl>
    </div>
  );
}

/** Plan que cubre todo el sistema necesario, debajo del recomendado y más pequeño. */
function OpcionCubreMas({
  oferta,
  onPedir,
}: {
  oferta: OfertaProveedor;
  onPedir: () => void;
}) {
  return (
    <div className="mt-4 rounded-lg border border-ink-950/10 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-ink-950">{oferta.plan?.nombre}</p>
        <Etiqueta>Cubre más de tu consumo</Etiqueta>
      </div>
      <dl className="mt-2 divide-y divide-ink-950/6">
        {oferta.plan && <Fila label="Potencia">{formatDecimal(oferta.plan.kwp)} kW</Fila>}
        <Fila label="Inversión estimada">
          ≈ {formatCOPMiles(oferta.inversion)}
          <Nota>
            entre {formatCOPMiles(oferta.inversionMin)} y {formatCOPMiles(oferta.inversionMax)}
          </Nota>
        </Fila>
        <Fila label="Se paga en">
          {oferta.retornoMeses !== null
            ? `${formatDecimal(oferta.retornoMeses / 12)} años`
            : "No se paga"}
        </Fila>
      </dl>
      <Button variant="secondary" size="md" className="mt-3 w-full" onClick={onPedir}>
        Pedir cotización del {oferta.plan?.nombre}
      </Button>
    </div>
  );
}

export function ProveedorCard({
  oferta,
  menorInversion,
  onPedir,
}: {
  oferta: OfertaProveedor;
  menorInversion: boolean;
  /** Sin plan: el plan recomendado (o el proveedor, si no vende por planes). */
  onPedir: (plan?: string) => void;
}) {
  const { financiacion: fin } = oferta;
  const etiquetaDatos = ETIQUETA_DATOS[oferta.estadoDatos];

  if (!oferta.aplica) {
    return (
      <article className="rounded-xl border border-dashed border-ink-950/12 bg-white/60 p-5 text-ink-800/60">
        <div className="flex flex-wrap items-center gap-2">
          <h5 className="text-base font-bold text-ink-950/50">{oferta.proveedor}</h5>
          {etiquetaDatos && <Etiqueta>{etiquetaDatos}</Etiqueta>}
        </div>
        <p className="mt-2 text-sm">{oferta.motivoNoAplica}</p>
        {oferta.notaCobertura && <p className="mt-2 text-xs">{oferta.notaCobertura}</p>}
      </article>
    );
  }

  return (
    <article className="flex flex-col rounded-xl border border-ink-950/10 bg-white p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h5 className="text-base font-bold text-ink-950">{oferta.proveedor}</h5>
        {etiquetaDatos && <Etiqueta>{etiquetaDatos}</Etiqueta>}
        {menorInversion && <Etiqueta>Menor inversión</Etiqueta>}
        {fin && <Etiqueta>Con financiación</Etiqueta>}
      </div>
      {oferta.notaCobertura && (
        <p className="mt-2 text-xs text-ink-800/60">{oferta.notaCobertura}</p>
      )}

      <dl className="mt-3 divide-y divide-ink-950/6">
        {oferta.plan && (
          <Fila label="Plan">
            {oferta.plan.nombre}
            <Nota>{formatDecimal(oferta.plan.kwp)} kW</Nota>
          </Fila>
        )}
        <Fila label="Inversión estimada">
          ≈ {formatCOPMiles(oferta.inversion)}
          <Nota>
            entre {formatCOPMiles(oferta.inversionMin)} y {formatCOPMiles(oferta.inversionMax)}
          </Nota>
        </Fila>
        {fin ? (
          <>
            <Fila label="Cuota inicial">{formatCOPMiles(fin.cuotaInicial)}</Fila>
            <Fila label="Cuota mensual">
              {formatCOPMiles(fin.cuotaMensual)}
              <Nota>durante {fin.plazoMeses} meses</Nota>
            </Fila>
            <Fila label="Ahorro menos cuota">
              <Flujo valor={fin.flujoMensual} />
              <Nota>al mes mientras pagas</Nota>
            </Fila>
          </>
        ) : (
          <>
            <Fila label="Forma de pago">
              <span className="font-medium">{oferta.pagoDescripcion}</span>
            </Fila>
            {oferta.primerPago !== undefined && (
              <Fila label="Primer pago">{formatCOPMiles(oferta.primerPago)}</Fila>
            )}
          </>
        )}
        <Fila label="Se paga en">
          {oferta.retornoMeses !== null
            ? `${formatDecimal(oferta.retornoMeses / 12)} años`
            : "No se paga"}
        </Fila>
        {oferta.instalacion && <Fila label="Instalación">{oferta.instalacion}</Fila>}
      </dl>

      {oferta.simulacionPago && (
        <SimulacionPago proveedor={oferta.proveedor} simulacion={oferta.simulacionPago} />
      )}

      <Button size="md" className="mt-4 w-full" onClick={() => onPedir()}>
        Pedir cotización con {oferta.proveedor}
      </Button>

      {oferta.cubreMas && (
        <OpcionCubreMas
          oferta={oferta.cubreMas}
          onPedir={() => onPedir(oferta.cubreMas!.plan?.nombre)}
        />
      )}
    </article>
  );
}
