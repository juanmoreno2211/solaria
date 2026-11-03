"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, ChartColumn } from "lucide-react";
import { guardarPendiente, type ResultadoPendiente } from "@/lib/negocio/resultado-pendiente";

/**
 * Repite el puente a Mi negocio al final del resultado, para quien bajó a
 * leer todo. Deja el resultado (solo números) en el navegador; Mi negocio lo
 * guarda en la cuenta tras ingresar.
 */
export function GuardarResultado({ datos }: { datos: ResultadoPendiente }) {
  const router = useRouter();
  const noConviene = datos.veredicto === "por_ahora_no";
  return (
    <div className="mt-10 flex flex-col gap-4 rounded-2xl border-2 border-sun-500/50 bg-sun-500/[0.08] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sun-500 text-white" aria-hidden="true">
          <ChartColumn className="h-5 w-5" />
        </span>
        <div>
          <p className="text-lg font-bold leading-snug text-ink-950">
            {noConviene ? "Todavía no lo necesitas, pero te ayudamos a ver dónde ahorrar" : "Guarda este resultado en tu cuenta"}
          </p>
          <p className="mt-1 text-sm text-ink-950/80">Mira qué aparatos pesan más en tu recibo y ponte metas de ahorro. Es gratis.</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          guardarPendiente(datos);
          // Sin sesión, proxy.ts manda a /ingresar y vuelve a Mi negocio.
          router.push("/mi-negocio");
        }}
        className="group inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-ink-950 px-6 text-[0.95rem] font-bold text-white transition-colors hover:bg-ink-800"
      >
        Guarda tu resultado y mira en qué gastas
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </button>
    </div>
  );
}
