"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * El sol recorre el arco de "Cómo funciona": sale a la izquierda (paso 1),
 * está en lo alto en el paso 2 y se pone a la derecha (paso 3). Luego vuelve
 * a salir. Si la persona pidió reducir el movimiento, se queda quieto arriba.
 *
 * Sigue la misma curva que el arco: M0 20 Q50 -18 100 20 (viewBox 100 × 20).
 */
const PUNTOS = 40;
const DURACION = 10; // segundos de amanecer a atardecer

function enLaCurva(t: number) {
  const x = 100 * t;
  const y = (1 - t) ** 2 * 20 + 2 * (1 - t) * t * -18 + t ** 2 * 20;
  return { left: x, top: (y / 20) * 100 };
}

const recorrido = Array.from({ length: PUNTOS + 1 }, (_, i) => enLaCurva(i / PUNTOS));
const izquierda = recorrido.map((p) => `${p.left}%`);
const arriba = recorrido.map((p) => `${p.top}%`);
// Aparece al salir y se desvanece al ponerse.
const opacidad = recorrido.map((_, i) => {
    const t = i / PUNTOS;
    return Math.min(1, t / 0.06, (1 - t) / 0.06);
    });
    // Más naranja cerca del horizonte, más claro al mediodía.
    const color = recorrido.map((_, i) => {
    const t = i / PUNTOS;
    return Math.abs(t - 0.5) < 0.25 ? "#e7b876" : "#d9842b";
    });

    const BASE =
    "absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_0_8px_rgba(226,161,82,0.18)]";

    export function SolDelArco() {
    const quieto = useReducedMotion();
    const mediodia = enLaCurva(0.5);

    if (quieto) {
        return (
        <span
            className={`${BASE} bg-sun-300`}
            style={{ left: `${mediodia.left}%`, top: `${mediodia.top}%` }}
        />
        );
    }

    return (
        <motion.span
        className={BASE}
        initial={{ left: izquierda[0], top: arriba[0], opacity: 0, backgroundColor: color[0] }}
        animate={{ left: izquierda, top: arriba, opacity: opacidad, backgroundColor: color }}
        transition={{
            duration: DURACION,
            ease: "linear",
            repeat: Infinity,
            repeatDelay: 1.2,
        }}
        />
    );
}