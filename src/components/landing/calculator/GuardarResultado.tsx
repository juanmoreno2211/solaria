"use client";

import { useRouter } from "next/navigation";
import { guardarPendiente, type ResultadoPendiente } from "@/lib/negocio/resultado-pendiente";

/**
 * Puente a Mi negocio para todos los veredictos. Deja el resultado (solo
 * números) en el navegador; Mi negocio lo guarda en la cuenta tras ingresar.
 */
export function GuardarResultado({ datos }: { datos: ResultadoPendiente }) {
  const router = useRouter();
  const noConviene = datos.veredicto === "por_ahora_no";
  return (
    <div className="mt-8 flex flex-col items-start gap-3 border-t border-ink-950/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-ink-950/75">
        {noConviene
          ? "Crea tu cuenta y mira qué aparatos pesan más en tu recibo."
          : "Guarda este resultado en tu cuenta y mira qué aparatos pesan más en tu recibo."}
      </p>
      <button
        type="button"
        onClick={() => {
          guardarPendiente(datos);
          // Sin sesión, proxy.ts manda a /ingresar y vuelve a Mi negocio.
          router.push("/mi-negocio");
        }}
        className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md border border-ink-950/20 bg-white px-5 text-sm font-semibold text-ink-950 transition-colors hover:border-ink-950/40 hover:bg-ink-950/[0.03]"
      >
        Guarda tu resultado y mira en qué gastas
      </button>
    </div>
  );
}
