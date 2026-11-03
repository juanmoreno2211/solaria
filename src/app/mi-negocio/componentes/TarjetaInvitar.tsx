"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { enlaceWhatsApp } from "@/lib/invitaciones/enlace";
import { formatNumber } from "@/lib/format";
import { crearInvitacion } from "../actions";
import { ayuda, botonPrimario, botonSecundario, campo, tarjeta } from "./estilos";
import { Copy, MessageCircle, UserPlus } from "lucide-react";
import { TituloTarjeta } from "./Titulo";

export function TarjetaInvitar({ enlace, aperturas, cuentas }: { enlace: string | null; aperturas: number; cuentas: number }) {
  const [copiado, setCopiado] = useState<"si" | "no" | null>(null);
  const [destacada, setDestacada] = useState(false);
  const ref = useRef<HTMLElement>(null);

  // Llegar desde la calculadora (?invitar=1), un aviso o #invitar resalta la tarjeta.
  useEffect(() => {
    let temporizador: ReturnType<typeof setTimeout>;
    const destacar = () => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      setDestacada(true);
      clearTimeout(temporizador);
      temporizador = setTimeout(() => setDestacada(false), 4000);
    };
    const params = new URLSearchParams(window.location.search);
    if (params.get("invitar") === "1" || window.location.hash === "#invitar") {
      // Espera a que la página termine de pintarse antes de bajar.
      temporizador = setTimeout(destacar, 300);
    }
    window.addEventListener("solaria:invitar", destacar);
    return () => {
      window.removeEventListener("solaria:invitar", destacar);
      clearTimeout(temporizador);
    };
  }, []);

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
    <section ref={ref} id="invitar" aria-labelledby="t-invitar" className={clsx(tarjeta, "scroll-mt-24 transition-shadow duration-500", destacada && "ring-4 ring-sun-500/60")}>
      <TituloTarjeta id="t-invitar" Icono={UserPlus} tono="hoja" subtitulo="Comparte tu enlace con otro dueño de negocio. No verá tus datos.">
        Invitar a mi socio
      </TituloTarjeta>

      {enlace ? (
        <>
          <label className="mt-4 block">
            <span className="sr-only">Tu enlace</span>
            <input id="enlace-invitacion" readOnly value={enlace} onFocus={(e) => e.currentTarget.select()} className={campo} />
          </label>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <a href={enlaceWhatsApp(enlace)} target="_blank" rel="noopener noreferrer" className={botonPrimario}>
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Compartir por WhatsApp
            </a>
            <button type="button" onClick={copiar} className={botonSecundario}>
              <Copy className="h-4 w-4" aria-hidden="true" />
              Copiar enlace
            </button>
          </div>
          <p aria-live="polite" className={ayuda}>
            {copiado === "si" && "Enlace copiado."}
            {copiado === "no" && "No pudimos copiarlo: selecciona el enlace y cópialo a mano."}
          </p>
          <p className="mt-2 text-sm text-ink-950/75">
            Se abrió <span className="font-semibold text-ink-950 tabular-nums">{formatNumber(aperturas)}</span> {aperturas === 1 ? "vez" : "veces"} ·{" "}
            <span className="font-semibold text-ink-950 tabular-nums">{formatNumber(cuentas)}</span> {cuentas === 1 ? "cuenta creada" : "cuentas creadas"}
          </p>
        </>
      ) : (
        <form action={crearInvitacion} className="mt-4">
          <button type="submit" className={botonPrimario}>
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Invitar a mi socio
          </button>
        </form>
      )}
    </section>
  );
}
