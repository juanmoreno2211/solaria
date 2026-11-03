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
    a: "Está pensado especialmente para microempresas y pequeños negocios en Colombia que dependen de la energía eléctrica: tiendas, supermercados, restaurantes, consultorios, talleres, ferreterías y fincas, entre otros. Aunque nos enfocamos en ellos, cualquier negocio que quiera entender si la energía solar le conviene puede usar SolarIA.",
  },
  {
    q: "¿Qué necesito para calcular mi ahorro?",
    a: "Solo necesitas el consumo mensual y el valor de tu recibo de luz. Con esa información estimamos tu ahorro potencial, la inversión aproximada y el tiempo en que podrías recuperarla.",
  },
  {
    q: "¿Qué tan confiable es el resultado?",
    a: "Es una estimación inicial basada en tu consumo, la radiación solar de tu departamento, tu horario de operación y precios de referencia. Te ayuda a decidir si vale la pena avanzar; la propuesta final la define el proveedor después de revisar tu instalación.",
  },
  {
    q: "¿Necesito comprar baterías para mis paneles solares?",
    a: "No siempre. Los paneles generan energía durante el día y pueden reducir tu recibo por sí solos. Las baterías almacenan esa energía para usarla en la noche o durante cortes de luz. En SolarIA revisamos tu consumo y te recomendamos baterías solo cuando realmente aportan a tu negocio.",
  },
  {
    q: "¿Qué pasa cuando pido una cotización?",
    a: "No estás solo. SolarIA te acompaña en cada paso: te ayuda a entender tu resultado, te conecta con proveedores confiables de tu región y hace seguimiento para que recibas una propuesta clara y tomes una decisión con tranquilidad.",  },
  {
    q: "¿Y si la energía solar no me conviene?",
    a: "Te lo decimos con claridad. Si tu consumo es bajo, tu horario no aprovecha bien el sol o la inversión tardaría demasiado en recuperarse, el resultado indicará que por ahora no es la mejor opción.",
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
            title="Resuelve tus dudas antes de comenzar"
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