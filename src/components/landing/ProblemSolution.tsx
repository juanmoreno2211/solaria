import { Compass, ReceiptText, Zap } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const PROBLEMAS = [
  {
    icon: Zap,
    title: "La luz se va o se baja, y tu negocio se frena",
    description:
      "Cada corte o bajón puede parar la caja, dañar equipos o echar a perder mercancía, y aun así la factura llega igual.",
  },
  {
    icon: ReceiptText,
    title: "La factura de luz pesa cada mes",
    description:
      "Para un negocio pequeño, la energía es un costo fijo alto que se paga con tarifa comercial, venda mucho o poco.",
  },
  {
    icon: Compass,
    title: "No sabes si la energía solar te conviene",
    description:
      "La información es técnica y dispersa, y pedir cotizaciones sin saber si vale la pena es perder tiempo.",
  },
];

export function ProblemSolution() {
  return (
    <section className="py-24 sm:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <Reveal>
            <span className="inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.14em] text-sun-600 uppercase">
              <span className="h-px w-6 bg-sun-500/60" />
              El problema
            </span>
            <h2 className="mt-5 text-balance text-2xl font-bold leading-[1.25] tracking-tight text-ink-950 sm:text-3xl lg:sticky lg:top-28">
              Saber si la energía solar le conviene a tu negocio toma tiempo y
              estudio. <span className="text-stone-500">SolarIA te da una primera respuesta en minutos.</span>
            </h2>
          </Reveal>

          <div className="divide-y divide-ink-950/8 border-t border-ink-950/8">
            {PROBLEMAS.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08}>
                <div className="flex gap-5 py-7 first:pt-0">
                  <p.icon className="mt-1 h-5 w-5 shrink-0 text-sun-600" strokeWidth={1.75} />
                  <div>
                    <h3 className="text-base font-semibold text-ink-950 sm:text-lg">
                      {p.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-stone-600 sm:text-[0.95rem]">
                      {p.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
