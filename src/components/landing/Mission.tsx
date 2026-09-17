import { Lightbulb, Sparkles, Target } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const PILARES = [
  {
    icon: Lightbulb,
    title: "Informar",
    description:
      "Explicamos en lenguaje simple qué opciones de energía solar existen y por qué, sin tecnicismos ni letra pequeña.",
  },
  {
    icon: Sparkles,
    title: "Incentivar",
    description:
      "Mostramos el ahorro real desde el primer minuto, para que dar el paso hacia la energía solar sea una decisión fácil, no un salto de fe.",
  },
  {
    icon: Target,
    title: "Optimizar",
    description:
      "Recomendamos justo lo que tu consumo necesita, ni más ni menos, para que cada peso invertido rinda a largo plazo.",
  },
];

export function Mission() {
  return (
    <section id="mision" className="py-24 sm:py-28">
      <Container className="max-w-4xl">
        <SectionHeading
          eyebrow="De dónde nace SolarIA"
          title="Ahorrar y consumir energía de forma más consciente no debería requerir ser experto en energía solar"
          description="Cada año, más hogares y negocios en Colombia sienten subir su factura de energía, mientras la información sobre paneles, baterías y alternativas solares sigue siendo técnica, dispersa y difícil de traducir en una decisión real. SolarIA nace para cerrar esa brecha: un agente que convierte tu recibo de luz en un plan claro, para que reducir tus gastos y tu huella energética a largo plazo sea tan simple como subir una foto."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {PILARES.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-black/5 bg-white p-7 text-center sm:text-left"
            >
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-sun-gradient text-ink-950 sm:mx-0">
                <p.icon className="h-5 w-5" strokeWidth={2.25} />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-ink-950">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-800/65">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
