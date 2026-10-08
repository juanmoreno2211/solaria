import { CheckCircle2, Lightbulb, Snowflake, SunMedium } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const SECUNDARIAS = [
  {
    icon: Lightbulb,
    title: "Iluminación solar",
    tag: "Inversión baja, resultado inmediato",
    description:
      "Linternas, reflectores y luces decorativas solares para exteriores, fachadas y zonas sin red eléctrica cercana. Se instala sin obras ni conexión a la red.",
  },
  {
    icon: Snowflake,
    title: "Refrigeración solar",
    tag: "Protege tu inventario",
    description:
      "Sistemas solares con respaldo para neveras y cuartos fríos de negocios y fincas con lácteos, alimentos o vacunas, para no perder la cadena de frío.",
  },
];

const PUNTOS_PANELES = [
  "Ideal si tu consumo y tu factura son medios o altos",
  "Cubre hasta la mayor parte de tu consumo mensual",
  "Vida útil de más de 20 años",
];

export function Alternatives() {
  return (
    <section id="alternativas" className="py-24 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            align="left"
            eyebrow="Alternativas de energía solar"
            title="Tres formas de aprovechar el sol, combinadas a tu medida"
            description="El agente evalúa cuáles aplican a tu caso y cómo combinarlas para maximizar tu ahorro."
          />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12 rounded-xl bg-ink-950 p-8 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <span className="inline-flex items-center gap-2.5 text-xs font-semibold tracking-wide text-sun-300 uppercase">
                  <SunMedium className="h-4 w-4" strokeWidth={1.75} />
                  La opción principal
                </span>
                <h3 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
                  Paneles solares
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/55 sm:text-base">
                  La inversión más alta, pero la que más reduce tu factura.
                  Dimensionamos el sistema según tu consumo real.
                </p>
              </div>
              <ul className="space-y-4 border-t border-white/10 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
                {PUNTOS_PANELES.map((punto) => (
                  <li key={punto} className="flex items-start gap-3 text-sm text-white/70">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sun-400" strokeWidth={1.75} />
                    {punto}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-10 border-t border-ink-950/8 pt-10 sm:grid-cols-2 sm:gap-12">
          {SECUNDARIAS.map((alt, i) => (
            <Reveal key={alt.title} delay={0.15 + i * 0.08}>
              <div className="flex items-center gap-3">
                <alt.icon className="h-5 w-5 text-stone-500" strokeWidth={1.75} />
                <h3 className="text-lg font-semibold text-ink-950">{alt.title}</h3>
              </div>
              <p className="mt-1 text-xs font-medium tracking-wide text-stone-500 uppercase">
                {alt.tag}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">
                {alt.description}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
