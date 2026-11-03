"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, UserPlus } from "lucide-react";
import { guardarPendiente, type ResultadoPendiente } from "@/lib/negocio/resultado-pendiente";

/** Barras de ejemplo para la ilustración: no son datos de nadie. */
const EJEMPLO = [
  { nombre: "Nevera", ancho: 82 },
  { nombre: "Aire", ancho: 58 },
  { nombre: "Luces", ancho: 26 },
];

/**
 * Lo primero que se ve con el resultado: guardarlo en SolarIA Control o
 * invitar a un socio. Los dos caminos necesitan cuenta, así que guardan el
 * resultado y llevan a Mi negocio (sin sesión, pasan antes por el registro).
 */
export function InvitarSocio({ datos }: { datos: ResultadoPendiente }) {
  const router = useRouter();
  const ir = (destino: string) => {
    guardarPendiente(datos);
    router.push(destino);
  };

  return (
    <div className="mb-8 overflow-hidden rounded-2xl bg-ink-950 text-white shadow-[0_24px_60px_-30px_rgba(10,14,22,0.7)]">
      <div className="grid gap-6 p-5 sm:p-7 md:grid-cols-[1fr_15rem] md:items-center">
        <div>
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-sun-300">
            <span aria-hidden className="h-px w-6 bg-sun-300/60" />
            ¡Este es tu resultado! · SolarIA Control
          </p>
          <p className="mt-3 text-balance text-xl font-bold leading-tight tracking-[-0.02em] sm:text-2xl">
            Guarda este resultado en tu cuenta y mira qué aparatos pesan más en tu recibo
          </p>
          <p className="mt-2 text-sm text-white/75">Gratis. Guardamos solo tus números, no la foto de tu recibo.</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => ir("/mi-negocio")}
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-sun-400 px-6 text-[0.95rem] font-bold text-ink-950 transition-colors hover:bg-sun-300"
            >
              Guarda tu resultado y mira en qué gastas
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => ir("/mi-negocio?invitar=1")}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/35 px-5 text-sm font-semibold text-white transition-colors hover:border-white/70 hover:bg-white/10"
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Invitar a mi socio
            </button>
          </div>
        </div>

        {/* Ilustración en CSS del ranking de Mi negocio. */}
        <div aria-hidden="true" className="hidden rounded-xl bg-white/[0.06] p-4 md:block">
          <p className="text-[11px] font-medium text-white/60">En qué gastas más · ejemplo</p>
          <div className="mt-3 space-y-2.5">
            {EJEMPLO.map((e) => (
              <div key={e.nombre}>
                <div className="text-xs text-white/75">{e.nombre}</div>
                <div className="mt-1 h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-sun-300 to-sun-500" style={{ width: `${e.ancho}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
