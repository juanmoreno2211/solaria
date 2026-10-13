"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import clsx from "clsx";

const PREGUNTAS = [
  {
    q: "¿Para qué tipo de negocios sirve?",
    a: "Para micronegocios que dependen de la luz: tiendas, supermercados, restaurantes, consultorios, talleres, ferreterías y fincas, entre otros. No está pensado para viviendas.",
  },
  {
    q: "¿Qué tan precisos son los cálculos?",
    a: "Son estimaciones de referencia hechas con tu consumo, tu región, tu horario y supuestos de precio que todavía estamos validando. Sirven para decidir si vale la pena pedir una cotización; la cifra final la da el proveedor.",
  },
  {
    q: "¿Qué pasa con la foto de mi recibo?",
    a: "Si subes una foto, la enviamos a Google (Gemini) solo para leer el consumo y el valor, y tú confirmas los números antes de seguir. Nosotros no la guardamos, pero en esta versión de prueba Google puede usarla para mejorar sus productos: tapa tu nombre, tu dirección y tu número de cuenta antes de subirla. Si prefieres, escribe los datos a mano.",
  },
  {
    q: "¿Qué pasa cuando pido una cotización?",
    a: "Eliges un proveedor, dejas tu nombre, celular y municipio, y marcas la autorización para compartir tus datos y tu estimado con él. Usamos esos datos solo para gestionar tu cotización. Por ahora estamos en una versión de prueba: algunos proveedores son de ejemplo y los precios de los proveedores reales son de referencia, no una cotización. En los dos casos tu solicitud la recibe el equipo de SolarIA, que la pasará al instalador. Pedirla no te obliga a comprar.",
  },
  {
    q: "¿Y si no me conviene?",
    a: "Te lo decimos. Si tu consumo es bajo o la inversión tarda mucho en pagarse, el resultado dirá \"por ahora no\". Si todavía no hay proveedores en tu región, también te lo diremos.",
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
