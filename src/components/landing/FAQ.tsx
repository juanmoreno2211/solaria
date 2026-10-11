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
    q: "¿Voy a tener luz cuando haya cortes?",
    a: "No con este cálculo. Estimamos el ahorro en tu factura con paneles sin baterías. Para tener luz durante un corte se necesitan baterías, que suben la inversión. Puedes pedírselas al proveedor en la cotización.",
  },
  {
    q: "¿Qué pasa con la foto de mi recibo?",
    a: "La usamos solo para leer el consumo y el valor pagado, y no la guardamos. Si prefieres no subirla, puedes escribir los datos a mano.",
  },
  {
    q: "¿Qué pasa cuando pido una cotización?",
    a: "Te pedimos tus datos de contacto y tu autorización. Solo con esa autorización los compartimos con el proveedor que elegiste, para que te contacte con una cotización real. Pedirla no te obliga a comprar.",
  },
  {
    q: "¿Y si no me conviene?",
    a: "Te lo decimos. Si tu consumo es bajo o la inversión tarda mucho en pagarse, el resultado dirá \"por ahora no\".",
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
