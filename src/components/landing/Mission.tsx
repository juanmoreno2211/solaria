import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";
import { ImagenSubida } from "@/components/ui/ImagenSubida";

const PILARES = [
  {
    n: "01",
    title: "Informar",
    description:
      "Explicamos qué opciones de energía solar existen y por qué, sin tecnicismos ni letra pequeña.",
  },
  {
    n: "02",
    title: "Incentivar",
    description:
      "Mostramos el ahorro estimado desde el primer minuto, para que dar el paso sea una decisión clara.",
  },
  {
    n: "03",
    title: "Optimizar",
    description:
      "Recomendamos justo lo que tu consumo necesita, para que cada peso invertido rinda a largo plazo.",
  },
];

export function Mission() {
  return (
    <section
      id="mision"
      className="relative isolate overflow-hidden bg-ink-950 py-24 text-white sm:py-32"
    >
      {/* Foto de fondo: public/imagenes/mision/mision.jpg (sin extensión en `base`). */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-20">
        <ImagenSubida
          base="imagenes/mision/mision"
          ajuste="cover"
          aviso={false}
          sizes="100vw"
          className="h-full w-full"
          respaldo={<div className="h-full w-full bg-gradient-to-br from-ink-900 to-ink-950" />}
        />
      </div>

      {/* Degradado para legibilidad, como en el inicio. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(90deg, rgba(10,14,22,0.88) 0%, rgba(10,14,22,0.68) 55%, rgba(10,14,22,0.38) 100%)",
        }}
      />

      <Container>
        <Reveal>
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div>
              <span className="inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-sun-200">
                <span aria-hidden className="h-px w-6 bg-sun-300/60" />
                De dónde nace SolarIA
              </span>

              <h2 className="mt-6 max-w-[22ch] text-balance text-3xl font-semibold leading-[1.12] tracking-[-0.035em] text-white sm:text-4xl md:text-[2.75rem]">
                Ahorrar energía no debería requerir de un experto.
              </h2>
            </div>

            <p className="max-w-xl text-balance text-base leading-[1.75] text-white/50 sm:text-lg lg:pt-14">
              En SolarIA creemos que cada negocio puede tomar el control de su energía. Convertimos su recibo de luz en el primer paso hacia un futuro más inteligente y sostenible.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-10 border-t border-white/15 pt-10 sm:grid-cols-3 sm:gap-8 sm:divide-x sm:divide-white/15">
          {PILARES.map((pilar, index) => (
            <Reveal
              key={pilar.title}
              delay={index * 0.1}
              className="sm:px-8 sm:first:pl-0"
            >
              <span className="font-mono text-sm font-medium text-sun-300/80">
                {pilar.n}
              </span>

              <h3 className="mt-3 text-lg font-semibold text-white">
                {pilar.title}
              </h3>

              <p className="mt-2 max-w-[34ch] text-sm leading-relaxed text-white/70">
                {pilar.description}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}