"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import clsx from "clsx";

const PREGUNTAS = [
  {
    q: "¿Qué tan precisos son los cálculos de ahorro?",
    a: "Son estimaciones de referencia basadas en tu consumo, tu tarifa y precios promedio del mercado solar colombiano. Son un excelente punto de partida, pero la cifra final depende de una cotización con un instalador certificado.",
  },
  {
    q: "¿Qué pasa con la foto de mi recibo? ¿Es segura?",
    a: "La foto se usa únicamente para extraer el consumo y el valor pagado, y no se comparte con terceros. Si prefieres no subir una imagen, puedes ingresar los datos manualmente.",
  },
  {
    q: "¿Sirve si vivo en una zona sin red eléctrica (ZNI)?",
    a: "Sí. Indícalo en el paso 2 y el agente ajusta los cálculos considerando que hoy dependes de plantas eléctricas o combustible, donde el ahorro con energía solar suele ser aún mayor.",
  },
  {
    q: "¿Puedo combinar varias alternativas solares?",
    a: "Sí, de hecho es lo más común: paneles para tu consumo general, iluminación solar para exteriores y refrigeración solar para proteger tu cadena de frío si tienes neveras.",
  },
  {
    q: "¿Necesito saber de energía solar para usar esto?",
    a: "No. Solo necesitas tu recibo de luz y algunos datos de tu casa, negocio o finca. El agente traduce todo a cifras simples de entender.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="preguntas" className="py-24 sm:py-28">
      <Container className="max-w-3xl">
        <Reveal>
          <SectionHeading
            eyebrow="Preguntas frecuentes"
            title="Todo lo que quieres saber antes de empezar"
          />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-14 divide-y divide-ink-950/8">
            {PREGUNTAS.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={item.q}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span className="text-base font-medium text-ink-950">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={clsx(
                        "h-4 w-4 shrink-0 text-stone-400 transition-transform duration-200",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>
                  {isOpen && (
                    <p className="max-w-xl pb-6 text-sm leading-relaxed text-stone-600">
                      {item.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
