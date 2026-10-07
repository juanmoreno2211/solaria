import { AlertTriangle, Compass, Lightbulb, Snowflake } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { Reveal } from "@/components/ui/Reveal";

const PROBLEMAS = [
  {
    icon: AlertTriangle,
    title: "El recibo de luz sube y no sabes por qué",
    description:
      "Sin visibilidad sobre tu consumo real es difícil saber qué tanto podrías ahorrar cambiando a energía solar.",
    accent: "ember" as const,
  },
  {
    icon: Compass,
    title: "Demasiadas opciones, poca claridad",
    description:
      "¿Paneles, linternas solares, refrigeración solar? Cada negocio, casa o finca necesita una combinación distinta.",
    accent: "sun" as const,
  },
  {
    icon: Snowflake,
    title: "Los cortes de energía afectan tu cadena de frío",
    description:
      "Negocios y fincas con neveras pierden inventario cuando se va la luz, sin un respaldo solar confiable.",
    accent: "leaf" as const,
  },
];

export function ProblemSolution() {
  return (
    <section className="py-24 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="El problema"
            title="Decidir qué solución solar te conviene, hoy toma tiempo y estudio"
            description="SolarIA hace ese trabajo por ti: analiza tu recibo y tu contexto, y te dice exactamente qué esperar en ahorro, dinero y tiempo."
          />
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {PROBLEMAS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.1}>
              <FeatureCard
                index={i + 1}
                icon={p.icon}
                title={p.title}
                description={p.description}
                accent={p.accent}
              />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-8 flex items-start gap-4 rounded-2xl border border-leaf-500/20 bg-leaf-500/5 p-6 sm:items-center">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-leaf-500/15 text-leaf-600">
              <Lightbulb className="h-5 w-5" />
            </span>
            <p className="text-sm leading-relaxed text-ink-900/80 sm:text-base">
              <span className="font-semibold text-ink-950">La solución: </span>
              un agente que lee tu recibo, entiende si eres una casa, un negocio
              o una finca, y te recomienda —con cifras— la mezcla de energía
              solar que más te conviene.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
