import { CheckCircle2, Lightbulb, Snowflake, SunMedium } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
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
    icon: "bg-sun-gradient text-ink-950",
    tag: "bg-sun-500/10 text-sun-600",
    check: "text-sun-600",
  },
  ember: {
    icon: "bg-ember-500/15 text-ember-600",
    tag: "bg-ember-500/10 text-ember-600",
    check: "text-ember-600",
  },
  leaf: {
    icon: "bg-leaf-500/15 text-leaf-600",
    tag: "bg-leaf-500/10 text-leaf-600",
    check: "text-leaf-600",
  },
};

export function Alternatives() {
  return (
    <section id="alternativas" className="py-24 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Alternativas de energía solar"
          title="Tres formas de aprovechar el sol, combinadas a tu medida"
          description="El agente evalúa cuáles aplican a tu caso y cómo combinarlas para maximizar tu ahorro."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {ALTERNATIVAS.map((alt) => {
            const accent = ACCENTS[alt.accent];
            return (
              <div
                key={alt.title}
                className="flex flex-col rounded-3xl border border-black/5 bg-white p-8 shadow-[0_1px_0_rgba(0,0,0,0.03)] transition-transform hover:-translate-y-1.5"
              >
                <span
                  className={clsx(
                    "flex h-12 w-12 items-center justify-center rounded-2xl",
                    accent.icon
                  )}
                >
                  <alt.icon className="h-6 w-6" strokeWidth={2.25} />
                </span>

                <span
                  className={clsx(
                    "mt-5 inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold",
                    accent.tag
                  )}
                >
                  {alt.tag}
                </span>

                <h3 className="mt-4 text-xl font-bold text-ink-950">
                  {alt.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-800/65">
                  {alt.description}
                </p>

                <ul className="mt-6 space-y-3 border-t border-black/5 pt-6">
                  {alt.puntos.map((punto) => (
                    <li
                      key={punto}
                      className="flex items-start gap-2.5 text-sm text-ink-800/75"
                    >
                      <CheckCircle2
                        className={clsx("mt-0.5 h-4 w-4 shrink-0", accent.check)}
                      />
                      {punto}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
