"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const MENSAJES = [
  "Leyendo tu consumo eléctrico...",
  "Cruzando tarifas y horas de sol de tu región...",
  "Comparando paneles, iluminación y refrigeración solar...",
  "Redactando tu recomendación personalizada...",
];

export function LoadingState() {
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndice((i) => Math.min(i + 1, MENSAJES.length - 1));
    }, 1100);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-14 text-center">
      <span className="flex h-14 w-14 animate-spin items-center justify-center rounded-full border-2 border-sun-500/20 border-t-sun-500 [animation-duration:1s]">
        <Sparkles className="h-5 w-5 text-sun-500" strokeWidth={2} />
      </span>

      <div>
        <p className="text-sm font-semibold text-ink-950">
          El agente está analizando tu información
        </p>
        <p className="mt-1.5 text-sm text-stone-500">{MENSAJES[indice]}</p>
      </div>

      <div className="flex gap-1.5">
        {MENSAJES.map((m, i) => (
          <span
            key={m}
            className={`h-1 w-6 rounded-full transition-colors duration-300 ${
              i <= indice ? "bg-sun-500" : "bg-ink-950/10"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
