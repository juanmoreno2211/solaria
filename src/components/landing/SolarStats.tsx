import { Leaf, Sun, TrendingUp, Wrench } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ColombiaMap } from "@/components/landing/ColombiaMap";

const DATOS = [
  {
    icon: Sun,
    valor: "Hasta 95%",
    label: "de tu consumo eléctrico se puede cubrir con un sistema solar bien dimensionado",
  },
  {
    icon: TrendingUp,
    valor: "4 – 7 años",
    label: "es el tiempo típico de retorno de una inversión en paneles solares en Colombia",
  },
  {
    icon: Wrench,
    valor: "25 – 30 años",
    label: "de vida útil tiene un panel solar bien mantenido, con mantenimiento mínimo",
  },
  {
    icon: Leaf,
    valor: "Energía limpia",
    label: "que reduce tu dependencia de fuentes no renovables y tu huella de carbono",
  },
];

export function SolarStats() {
  return (
    <section className="bg-ink-gradient py-24 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            light
            eyebrow="La energía solar en números"
            title="Antes de decidir, el panorama general"
            description="Datos generales sobre energía solar y el potencial de cada región de Colombia — independientes de tu caso puntual, que ya calculamos en la calculadora."
          />
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div className="grid gap-5 sm:grid-cols-2">
            {DATOS.map((d, i) => (
              <Reveal
                key={d.label}
                delay={i * 0.08}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-6"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sun-500/15 text-sun-300">
                  <d.icon className="h-4 w-4" strokeWidth={2} />
                </span>
                <p className="tabular-nums mt-4 text-2xl font-bold text-white">{d.valor}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-white/55">
                  {d.label}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.15}>
            <ColombiaMap />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
