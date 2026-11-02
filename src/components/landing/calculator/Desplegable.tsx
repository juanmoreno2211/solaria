"use client";

import { useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";

type Variante = "tarjeta" | "suave" | "plano";

const CONTENEDOR: Record<Variante, string> = {
  tarjeta: "rounded-xl border border-ink-950/10 bg-white",
  suave: "rounded-lg bg-cream-100/70",
  plano: "",
};

const BOTON: Record<Variante, string> = {
  tarjeta: "px-5 py-4",
  suave: "px-4 py-3",
  plano: "py-2",
};

const PANEL: Record<Variante, string> = {
  tarjeta: "px-5 pb-5",
  suave: "px-4 pb-4",
  plano: "pb-2 pt-1",
};

/**
 * Sección que se expande o se comprime. El resumen se ve aun cerrada, para que
 * el usuario sepa qué hay adentro sin abrirla.
 */
export function Desplegable({
  titulo,
  resumen,
  icono,
  abiertoInicial = false,
  variante = "tarjeta",
  className,
  children,
}: {
  titulo: string;
  resumen?: ReactNode;
  icono?: ReactNode;
  abiertoInicial?: boolean;
  variante?: Variante;
  className?: string;
  children: ReactNode;
}) {
  const id = useId();
  const [abierto, setAbierto] = useState(abiertoInicial);
  const sinMovimiento = useReducedMotion();

  return (
    <div className={clsx(CONTENEDOR[variante], className)}>
      <button
        type="button"
        id={`${id}-boton`}
        aria-expanded={abierto}
        aria-controls={`${id}-panel`}
        onClick={() => setAbierto((a) => !a)}
        className={clsx(
          "group flex w-full items-center gap-3 rounded-[inherit] text-left outline-none focus-visible:ring-2 focus-visible:ring-sun-500/40",
          BOTON[variante]
        )}
      >
        {icono && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sun-500/10 text-sun-600">
            {icono}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span
            className={clsx(
              "block font-semibold text-ink-950",
              variante === "plano" ? "text-xs text-sun-600" : "text-sm"
            )}
          >
            {titulo}
          </span>
          {resumen && (
            <span className="mt-0.5 block text-xs leading-relaxed text-ink-800/55">{resumen}</span>
          )}
        </span>
        {variante !== "plano" && (
          <span className="hidden text-xs font-semibold text-sun-600 sm:inline">
            {abierto ? "Ocultar" : "Ver"}
          </span>
        )}
        <ChevronDown
          aria-hidden
          className={clsx(
            "h-4 w-4 shrink-0 text-ink-950/40 transition-transform duration-200 group-hover:text-ink-950/70",
            abierto && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {abierto && (
          <motion.div
            id={`${id}-panel`}
            role="region"
            aria-labelledby={`${id}-boton`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: sinMovimiento ? 0 : 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className={PANEL[variante]}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}