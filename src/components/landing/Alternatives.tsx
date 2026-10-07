import { CheckCircle2, Lightbulb, Snowflake, SunMedium } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import clsx from "clsx";

const ALTERNATIVAS = [
  {
    icon: SunMedium,
    tag: "Mayor ahorro a largo plazo",
    title: "Paneles solares",
    description:
      "La inversión más alta, pero la que más reduce tu factura. Dimensionamos el sistema según tu consumo real.",
    puntos: [
      "Ideal si tu consumo y tu factura son medios o altos",
      "Cubre hasta la mayor parte de tu consumo mensual",
      "Vida útil de más de 20 años",
    ],
    accent: "sun" as const,
  },
  {
    icon: Lightbulb,
    tag: "Inversión baja, resultado inmediato",
    title: "Iluminación solar",
    description:
      "Linternas, reflectores y luces decorativas solares para exteriores, fachadas y zonas sin red eléctrica cercana.",
    puntos: [
      "Perfecta para exteriores, senderos y fachadas",
      "Ideal en zonas rurales o con cortes frecuentes",
      "Se instala sin obras ni conexión a la red",
    ],
    accent: "ember" as const,
  },
  {
    icon: Snowflake,
    tag: "Protege tu inventario",
    title: "Refrigeración solar",
    description:
      "Sistemas solares con respaldo para neveras y cuartos fríos, pensados para no perder la cadena de frío.",
    puntos: [
      "Clave para negocios y fincas con lácteos, alimentos o vacunas",
      "Reduce el impacto de los cortes de energía",
      "Se dimensiona según la capacidad de tu refrigeración",
    ],
    accent: "leaf" as const,
  },
];

const ACCENTS = {
  sun: {
    icon: "bg-sun-500/10 text-sun-600",
    tag: "text-sun-600",
    check: "text-sun-600",
    border: "hover:border-sun-500/30",
    underline: "group-hover:bg-sun-500",
  },
  ember: {
    icon: "bg-ember-500/10 text-ember-600",
    tag: "text-ember-600",
    check: "text-ember-600",
    border: "hover:border-ember-500/30",
    underline: "group-hover:bg-ember-500",
  },
  leaf: {
    icon: "bg-leaf-500/10 text-leaf-600",
    tag: "text-leaf-600",
    check: "text-leaf-600",
    border: "hover:border-leaf-500/30",
    underline: "group-hover:bg-leaf-500",
  },
};

export function Alternatives() {
  return (
    <section id="alternativas" className="py-24 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Alternativas de energía solar"
            title="Tres formas de aprovechar el sol, combinadas a tu medida"
            description="El agente evalúa cuáles aplican a tu caso y cómo combinarlas para maximizar tu ahorro."
          />
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {ALTERNATIVAS.map((alt, i) => {
            const accent = ACCENTS[alt.accent];
            return (
              <Reveal
                key={alt.title}
                delay={i * 0.1}
                className={clsx(
                  "group relative flex flex-col overflow-hidden rounded-xl border border-ink-950/8 bg-white p-8 transition-colors duration-200",
                  accent.border
                )}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-1 -top-3 select-none text-6xl font-bold leading-none text-ink-950/[0.045]"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <span
                  className={clsx(
                    "relative flex h-11 w-11 items-center justify-center rounded-lg",
                    accent.icon
                  )}
                >
                  <alt.icon className="h-5 w-5" strokeWidth={2} />
                </span>

                <span
                  className={clsx(
                    "relative mt-5 inline-flex w-fit items-center text-xs font-semibold tracking-wide uppercase",
                    accent.tag
                  )}
                >
                  {alt.tag}
                </span>

                <h3 className="relative mt-3 text-xl font-bold text-ink-950">
                  {alt.title}
                </h3>
                <p className="relative mt-2 text-sm leading-relaxed text-stone-600">
                  {alt.description}
                </p>

                <ul className="relative mt-6 space-y-3 border-t border-ink-950/8 pt-6">
                  {alt.puntos.map((punto) => (
                    <li
                      key={punto}
                      className="flex items-start gap-2.5 text-sm text-stone-600"
                    >
                      <CheckCircle2
                        className={clsx("mt-0.5 h-4 w-4 shrink-0", accent.check)}
                      />
                      {punto}
                    </li>
                  ))}
                </ul>

                <span
                  aria-hidden
                  className={clsx(
                    "relative mt-6 block h-px w-8 bg-ink-950/15 transition-all duration-200 group-hover:w-12",
                    accent.underline
                  )}
                />
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
