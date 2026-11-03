"use client";

import { useState } from "react";
import { enlaceWhatsApp } from "@/lib/invitaciones/enlace";
import { formatNumber } from "@/lib/format";
import { crearInvitacion } from "../actions";
import { ayuda, botonPrimario, botonSecundario, campo, tarjeta, tituloTarjeta } from "./estilos";

export function TarjetaInvitar({ enlace, aperturas, cuentas }: { enlace: string | null; aperturas: number; cuentas: number }) {
  const [copiado, setCopiado] = useState<"si" | "no" | null>(null);

  async function copiar() {
    if (!enlace) return;
    try {
      await navigator.clipboard.writeText(enlace);
      setCopiado("si");
    } catch {
      // Sin permiso de portapapeles: el campo queda seleccionado para copiar a mano.
      document.querySelector<HTMLInputElement>("#enlace-invitacion")?.select();
      setCopiado("no");
    }
  }

  return (
    <section aria-labelledby="t-invitar" className={tarjeta}>
      <h2 id="t-invitar" className={tituloTarjeta}>Invitar a mi socio</h2>
      <p className="mt-1 text-sm text-ink-950/75">
        Comparte tu enlace con otro dueño de negocio para que vea en qué gasta más energía el suyo. No verá tus datos.
      </p>

      {enlace ? (
        <>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-sm font-semibold text-ink-950">Tu enlace</span>
            <input id="enlace-invitacion" readOnly value={enlace} onFocus={(e) => e.currentTarget.select()} className={campo} />
          </label>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <a href={enlaceWhatsApp(enlace)} target="_blank" rel="noopener noreferrer" className={botonPrimario}>
              Compartir por WhatsApp
            </a>
            <button type="button" onClick={copiar} className={botonSecundario}>
              Copiar enlace
            </button>
          </div>
          <p aria-live="polite" className={ayuda}>
            {copiado === "si" && "Enlace copiado."}
            {copiado === "no" && "No pudimos copiarlo: selecciona el enlace y cópialo a mano."}
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-cream-50 p-3">
              <dt className="text-xs font-medium text-ink-950/65">Veces que se abrió</dt>
              <dd className="text-lg font-semibold tabular-nums text-ink-950">{formatNumber(aperturas)}</dd>
            </div>
            <div className="rounded-lg bg-cream-50 p-3">
              <dt className="text-xs font-medium text-ink-950/65">Cuentas creadas con él</dt>
              <dd className="text-lg font-semibold tabular-nums text-ink-950">{formatNumber(cuentas)}</dd>
            </div>
          </dl>
          <p className={ayuda}>Contamos una vez cada navegador que abre el enlace; tus propias visitas con tu sesión no cuentan.</p>
        </>
      ) : (
        <form action={crearInvitacion} className="mt-4">
          <button type="submit" className={botonPrimario}>Invitar a mi socio</button>
        </form>
      )}
    </section>
  );
}
