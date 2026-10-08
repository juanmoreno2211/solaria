import { AlertTriangle, Compass, Snowflake } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const PROBLEMAS = [
  {
    icon: AlertTriangle,
    title: "El recibo de luz sube y no sabes por qué",
    description:
      "Sin visibilidad sobre tu consumo real es difícil saber qué tanto podrías ahorrar cambiando a energía solar.",
  },
  {
    icon: Compass,
    title: "Demasiadas opciones, poca claridad",
    description:
      "¿Paneles, linternas solares, refrigeración solar? Cada negocio, casa o finca necesita una combinación distinta.",
  },
  {
    icon: Snowflake,
    title: "Los cortes de energía afectan tu cadena de frío",
    description:
      "Negocios y fincas con neveras pierden inventario cuando se va la luz, sin un respaldo solar confiable.",
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
              Decidir qué solución solar te conviene hoy toma tiempo y
              estudio. <span className="text-stone-500">SolarIA hace ese trabajo por ti.</span>
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
