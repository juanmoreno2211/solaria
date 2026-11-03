"use client";

import { useState } from "react";
import { formatDecimal } from "@/lib/format";
import { borrarAparato } from "../actions";
import type { AparatoFila } from "../datos";
import { FormularioAparato } from "./FormularioAparato";
import { botonSecundario } from "./estilos";

export function FilaAparato({ aparato, kwhMes, deReferencia }: { aparato: AparatoFila; kwhMes: number; deReferencia: boolean }) {
  const [editando, setEditando] = useState(false);
  return (
    <li className="py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-ink-950">
            {aparato.cantidad} × {aparato.nombre}
          </p>
          <p className="text-sm text-ink-950/65">
            {aparato.kwh_anio_etiqueta
              ? `Etiqueta: ${formatDecimal(aparato.kwh_anio_etiqueta)} kWh al año`
              : `${aparato.potencia_w ?? 0} W · ${aparato.horas_dia ?? 0} h al día · ${Math.round(aparato.factor_ciclo * 100)} % a plena potencia`}
            {" · "}≈ {formatDecimal(kwhMes)} kWh al mes
            {deReferencia && <span className="ml-1 rounded bg-cream-100 px-1.5 py-0.5 text-xs font-semibold text-ink-950/80">valor de referencia</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className={botonSecundario} onClick={() => setEditando((v) => !v)} aria-expanded={editando}>
            {editando ? "Cerrar" : "Editar"}
          </button>
          <form action={borrarAparato}>
            <input type="hidden" name="id" value={aparato.id} />
            <button type="submit" className={botonSecundario} aria-label={`Borrar ${aparato.nombre}`}>
              Borrar
            </button>
          </form>
        </div>
      </div>
      {editando && (
        <div className="mt-4 rounded-lg border border-ink-950/10 p-4">
          <FormularioAparato aparato={aparato} onListo={() => setEditando(false)} />
        </div>
      )}
    </li>
  );
}
