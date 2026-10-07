import { ClipboardList, FileScan, Sparkles, TrendingUp } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const PASOS = [
  {
    icon: FileScan,
    title: "Sube tu recibo",
    description:
      "Toma una foto de tu recibo de luz o ingresa el consumo y valor manualmente.",
  },
  {
    icon: ClipboardList,
    title: "Cuéntanos tu predio",
    description:
      "Casa, negocio o finca; si tienes neveras que proteger o iluminación exterior que mejorar.",
  },
  {
    icon: Sparkles,
    title: "El agente analiza con IA",
    description:
      "Cruza tu consumo, tu tarifa y tu contexto para dimensionar cada alternativa solar.",
  },
  {
    icon: TrendingUp,
    title: "Recibe tu plan de ahorro",
    description:
      "Ahorro en %, en dinero al mes y tiempo de retorno de cada solución, explicado en lenguaje simple.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="bg-cream-100/50 py-24 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Cómo funciona"
            title="De tu recibo a tu plan de ahorro solar, en 4 pasos"
            description="Todo el proceso toma un par de minutos y no necesitas saber nada de energía solar para empezar."
          />
        </Reveal>

        <div className="relative mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div
            aria-hidden
            className="absolute top-6 left-0 right-0 hidden h-px bg-gradient-to-r from-transparent via-black/10 to-transparent lg:block"
          />
          {PASOS.map((paso, i) => (
            <Reveal key={paso.title} delay={i * 0.1} className="relative flex flex-col items-start">
              <div className="flex items-center gap-3">
                <span className="relative z-10 flex h-11 w-11 items-center justify-center rounded-lg bg-sun-500/10 text-sun-600">
                  <paso.icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <span className="text-xs font-semibold text-ink-950/30">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-ink-950">
                {paso.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                {paso.description}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
