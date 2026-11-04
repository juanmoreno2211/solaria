"use client";

import { useState } from "react";
import clsx from "clsx";
import { Trophy, Zap } from "lucide-react";
import { riesgoDe } from "@/lib/aparatos/riesgo";
import { formatCOP, formatDecimal } from "@/lib/format";
import { borrarAparato } from "../actions";
import type { AparatoFila } from "../datos";
import { FormularioAparato } from "./FormularioAparato";
import { IconoAparato } from "./iconos";

const pesos = (v: number) => formatCOP(Math.round(v / 100) * 100);

/**
 * Una tarjeta por aparato. La barra usa style.width (Tailwind no genera
 * anchos dinámicos) y el porcentaje va escrito al lado: la barra es decorativa.
 */
export function TarjetaAparato({
  aparato,
  kwhMes,
  costoMes,
  porcentaje,
  anchoBarra,
  primero,
  deReferencia,
  generaEnergia,
}: {
  aparato: AparatoFila;
  kwhMes: number;
  costoMes: number | null;
  porcentaje: number | null;
  anchoBarra: number;
  primero: boolean;
  deReferencia: boolean;
  generaEnergia: boolean;
}) {
  const [editando, setEditando] = useState(false);
  const riesgo = riesgoDe(aparato.tipo_catalogo);

  return (
    <li className={clsx("rounded-2xl border bg-white p-4", primero ? "border-sun-500 shadow-[0_8px_24px_-16px_rgba(181,106,29,0.6)]" : "border-ink-950/10")}>
      <div className="flex items-start gap-3">
        <span className={clsx("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", primero ? "bg-sun-400 text-ink-950" : "bg-cream-100 text-ink-800")} aria-hidden="true">
          <IconoAparato tipo={aparato.tipo_catalogo} className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-base font-bold text-ink-950">
              {aparato.nombre}
              {aparato.cantidad > 1 && <span className="font-semibold text-ink-950/70"> × {aparato.cantidad}</span>}
            </h3>
            {primero && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sun-400 px-2 py-0.5 text-xs font-bold text-ink-950">
                <Trophy className="h-3 w-3" aria-hidden="true" />
                El que más pesa
              </span>
            )}
          </div>
          {riesgo && riesgo !== "bajo" && (
            <p
              className={clsx(
                "mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                riesgo === "alto" ? "bg-red-50 text-red-700" : "bg-cream-100 text-ink-950"
              )}
            >
              <Zap className="h-3 w-3" aria-hidden="true" />
              Si se va y vuelve la luz: riesgo {riesgo} de dañarse
            </p>
          )}

          {generaEnergia ? (
            <p className="mt-1 text-sm text-ink-950/75">Genera energía con combustible: no suma a tu recibo.</p>
          ) : (
            <>
              <p className="mt-0.5 text-sm text-ink-950/75">
                {formatDecimal(kwhMes)} kWh al mes · estimado
                {deReferencia && <span className="ml-1.5 inline-block whitespace-nowrap rounded bg-cream-100 px-1.5 py-0.5 text-xs font-semibold text-ink-950">valor de referencia</span>}
              </p>
              {(costoMes != null || porcentaje != null) && (
                <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3">
                  {costoMes != null && <p className="text-xl font-bold tracking-tight text-ink-950 tabular-nums">~{pesos(costoMes)} <span className="text-sm font-semibold text-ink-950/70">al mes</span></p>}
                  {porcentaje != null && <p className="text-sm font-semibold text-ink-950 tabular-nums">{formatDecimal(porcentaje)} % de tu consumo</p>}
                </div>
              )}
              <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-ink-950/10" aria-hidden="true">
                <div className={clsx("h-full rounded-full", primero ? "bg-sun-600" : "bg-sun-400")} style={{ width: `${Math.max(2, Math.min(100, anchoBarra))}%` }} />
              </div>
            </>
          )}

          <div className="mt-2 flex gap-1">
            <button
              type="button"
              onClick={() => setEditando((v) => !v)}
              aria-expanded={editando}
              className="min-h-11 rounded-md px-2.5 text-sm font-semibold text-ink-950 underline-offset-4 hover:underline"
            >
              {editando ? "Cerrar" : "Editar"}
            </button>
            <form action={borrarAparato}>
              <input type="hidden" name="id" value={aparato.id} />
              <button type="submit" aria-label={`Borrar ${aparato.nombre}`} className="min-h-11 rounded-md px-2.5 text-sm font-semibold text-ink-950/75 underline-offset-4 hover:underline">
                Borrar
              </button>
            </form>
          </div>
        </div>
      </div>
      {editando && (
        <div className="mt-3 rounded-xl border border-ink-950/10 bg-cream-50 p-4">
          <FormularioAparato aparato={aparato} onListo={() => setEditando(false)} />
        </div>
      )}
    </li>
  );
}
