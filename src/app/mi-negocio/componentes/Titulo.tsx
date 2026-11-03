import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

const TONOS = {
  sol: "bg-sun-500/15 text-sun-600",
  hoja: "bg-leaf-500/15 text-leaf-700",
  tinta: "bg-ink-950/8 text-ink-800",
};

/** Título de tarjeta con insignia de ícono, como los pasos de la calculadora. */
export function TituloTarjeta({
  id,
  Icono,
  children,
  subtitulo,
  tono = "sol",
}: {
  id: string;
  Icono: LucideIcon;
  children: React.ReactNode;
  subtitulo?: React.ReactNode;
  tono?: keyof typeof TONOS;
}) {
  return (
    <div className="flex items-start gap-3.5">
      <span className={clsx("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", TONOS[tono])} aria-hidden="true">
        <Icono className="h-5 w-5" strokeWidth={2} />
      </span>
      <div className="min-w-0 pt-0.5">
        <h2 id={id} className="text-lg font-bold tracking-[-0.01em] text-ink-950 sm:text-xl">{children}</h2>
        {subtitulo && <p className="mt-0.5 text-sm text-ink-950/70">{subtitulo}</p>}
      </div>
    </div>
  );
}
