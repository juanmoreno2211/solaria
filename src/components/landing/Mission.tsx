import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";

const PILARES = [
  {
    n: "01",
    title: "Informar",
    description:
      "Explicamos en lenguaje simple qué opciones de energía solar existen y por qué, sin tecnicismos ni letra pequeña.",
  },
  {
    n: "02",
    title: "Incentivar",
    description:
      "Mostramos el ahorro real desde el primer minuto, para que dar el paso hacia la energía solar sea una decisión fácil, no un salto de fe.",
  },
  {
    n: "03",
    title: "Optimizar",
    description:
      "Recomendamos justo lo que tu consumo necesita, ni más ni menos, para que cada peso invertido rinda a largo plazo.",
  },
];

export function Mission() {
  return (
    <section id="mision" className="py-24 sm:py-28">
      <Container className="max-w-5xl">
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <span className="inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.14em] text-sun-600 uppercase">
                <span className="h-px w-6 bg-sun-500/60" />
                De dónde nace SolarIA
              </span>
              <h2 className="mt-5 text-balance text-2xl font-bold leading-[1.2] tracking-tight text-ink-950 sm:text-[1.75rem]">
                Ahorrar y consumir energía de forma más consciente no debería
                requerir ser experto en energía solar.
              </h2>
            </div>
            <p className="max-w-xl text-balance text-base leading-relaxed text-stone-600 lg:pt-1 lg:text-lg">
              Cada año sube tu factura, pero la información sobre energía
              solar sigue siendo técnica y dispersa. SolarIA la convierte en
              un plan claro, tan simple como subir una foto.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-10 sm:grid-cols-3 sm:gap-8 sm:divide-x sm:divide-ink-950/10">
          {PILARES.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.1} className="sm:px-8 sm:first:pl-0">
              <span className="font-mono text-sm font-medium text-sun-600/70">
                {p.n}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-ink-950">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                {p.description}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
