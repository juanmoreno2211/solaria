"use client";

/** Aviso tras agregar un aparato: lleva a la tarjeta "Invitar a mi socio". */
export function AvisoInvitar() {
  return (
    <div role="status" className="rounded-lg border border-sun-500/40 bg-sun-500/10 p-4">
      <p className="text-base font-bold text-ink-950">¡Aparato guardado! Ahora invita a tu socio</p>
      <p className="mt-1 text-sm text-ink-950/80">
        ¿Conoces a otro dueño de negocio que pague mucha luz? Mándale tu enlace para que vea en qué gasta más el suyo. No verá tus datos.
      </p>
      <a
        href="#invitar"
        onClick={() => window.dispatchEvent(new Event("solaria:invitar"))}
        className="mt-3 inline-flex min-h-11 items-center justify-center rounded-md bg-ink-950 px-5 text-sm font-semibold text-white hover:bg-ink-800"
      >
        Invitar a mi socio
      </a>
    </div>
  );
}
