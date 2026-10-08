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
            title="De tu recibo a tu plan de ahorro solar"
            description="Todo el proceso toma un par de minutos y no necesitas saber nada de energía solar para empezar."
          />
        </Reveal>

        <div className="relative mt-16 grid gap-10 sm:grid-cols-4 sm:gap-6">
          <div
            aria-hidden
            className="absolute left-5 top-5 bottom-5 w-px bg-ink-950/10 sm:bottom-auto sm:left-0 sm:right-0 sm:h-px sm:w-auto"
          />
          {PASOS.map((paso, i) => (
            <Reveal key={paso.title} delay={i * 0.08} className="relative flex gap-5 sm:block">
              <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-sun-500/30 bg-cream-50 text-sun-600">
                <paso.icon className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.75} />
              </span>
              <div className="sm:mt-5 sm:pr-4">
                <h3 className="text-base font-semibold text-ink-950">
                  {paso.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
                  {paso.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
