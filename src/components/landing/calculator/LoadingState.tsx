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
      <span className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-sun-500/25" />
        <span className="relative flex h-14 w-14 animate-spin items-center justify-center rounded-full bg-sun-gradient [animation-duration:2.2s]">
          <Sparkles className="h-6 w-6 text-ink-950" strokeWidth={2.25} />
        </span>
      </span>

      <div>
        <p className="text-sm font-semibold text-ink-950">
          El agente está analizando tu información
        </p>
        <p className="mt-1.5 text-sm text-ink-800/55">{MENSAJES[indice]}</p>
      </div>

      <div className="flex gap-1.5">
        {MENSAJES.map((m, i) => (
          <span
            key={m}
            className={`h-1.5 w-6 rounded-full transition-colors duration-300 ${
              i <= indice ? "bg-sun-500" : "bg-black/10"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
