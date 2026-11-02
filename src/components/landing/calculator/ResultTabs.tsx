"use client";

import { useRef, type KeyboardEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";

export type PestanaResultado = "proveedores" | "ahorro" | "calculo";
type Pestana = PestanaResultado;

/** Pestañas accesibles: flechas para moverse, una sola sección visible a la vez. */
export function PestanasResultado({
  pestanas,
  activa,
  onCambiar,
  idBase,
}: {
  pestanas: { id: Pestana; label: string; corto: string }[];
  activa: Pestana;
  onCambiar: (p: Pestana) => void;
  idBase: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const sinMovimiento = useReducedMotion();

  function teclas(event: KeyboardEvent<HTMLButtonElement>, i: number) {
    const paso = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!paso) return;
    event.preventDefault();
    const siguiente = (i + paso + pestanas.length) % pestanas.length;
    onCambiar(pestanas[siguiente].id);
    refs.current[siguiente]?.focus();
  }

  return (
    <div role="tablist" aria-label="Detalle del resultado" className="flex gap-4 overflow-x-auto border-b border-ink-950/10 sm:gap-6">
      {pestanas.map((p, i) => {
        const seleccionada = p.id === activa;
        return (
          <button
            key={p.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${idBase}-tab-${p.id}`}
            aria-selected={seleccionada}
            aria-controls={`${idBase}-panel-${p.id}`}
            tabIndex={seleccionada ? 0 : -1}
            onClick={() => onCambiar(p.id)}
            onKeyDown={(e) => teclas(e, i)}
            className={clsx(
              "relative shrink-0 whitespace-nowrap pb-3 pt-1 text-[13px] font-semibold sm:text-sm outline-none transition-colors focus-visible:text-sun-600",
              seleccionada ? "text-ink-950" : "text-ink-800/50 hover:text-ink-800/80"
            )}
          >
            <span className="sm:hidden">{p.corto}</span>
            <span className="hidden sm:inline">{p.label}</span>
            {seleccionada && (
              <motion.span
                layoutId={`${idBase}-subrayado`}
                transition={{ duration: sinMovimiento ? 0 : 0.22, ease: "easeOut" }}
                className="absolute inset-x-0 -bottom-px h-0.5 bg-ink-950"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
