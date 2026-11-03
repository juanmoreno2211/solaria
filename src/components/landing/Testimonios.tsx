import { HardHat } from "lucide-react";
import clsx from "clsx";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { ImagenSubida } from "@/components/ui/ImagenSubida";
import { IlustracionNegocio } from "@/components/landing/calculator/IlustracionNegocio";
import { TESTIMONIOS, type Testimonio } from "@/lib/testimonios";

function Iniciales({ nombre }: { nombre: string }) {
  const iniciales = nombre
    .split(" ")
    .filter((parte) => parte.length > 1)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("");

  return (
    <span className="flex size-full items-center justify-center bg-gradient-to-br from-sun-200 to-sun-400 text-base font-semibold text-ink-950">
      {iniciales}
    </span>
  );
}

function Retrato({ t, grande }: { t: Testimonio; grande?: boolean }) {
  const marco = clsx(
    "overflow-hidden bg-cream-200/70",
    grande
      ? "aspect-[4/3] rounded-[1.75rem] lg:aspect-auto lg:h-full"
      : "size-12 shrink-0 rounded-xl",
  );

  const casco = (
    <HardHat
      className={clsx("text-sun-500/70", grande ? "size-16" : "size-6")}
      strokeWidth={1.25}
    />
  );

  const respaldo =
    t.rol === "instalador" ? (
      casco
    ) : t.tipo ? (
      <IlustracionNegocio
        tipo={t.tipo}
        className={grande ? "h-28 w-auto" : "h-9 w-auto"}
      />
    ) : (
      <Iniciales nombre={t.nombre} />
    );

  const ruta = grande ? t.foto : (t.fotoPequena ?? t.foto);

  if (ruta) {
    return (
      <ImagenSubida
        base={ruta}
        alt={`${t.nombre}, ${t.negocio}`}
        ajuste="cover"
        aviso={Boolean(grande)}
        sizes={grande ? "(min-width: 1024px) 40vw, 90vw" : "48px"}
        className={marco}
        respaldo={respaldo}
      />
    );
  }

  return (
    <div className={clsx(marco, "flex items-center justify-center")}>
      {t.rol === "instalador" ? casco : <Iniciales nombre={t.nombre} />}
    </div>
  );
}

function Firma({
  t,
  compacto,
  claro,
}: {
  t: Testimonio;
  compacto?: boolean;
  claro?: boolean;
}) {
  const detalle = [t.negocio, t.lugar].filter(Boolean).join(" · ");

  return (
    <figcaption className={clsx("leading-snug", compacto && "text-[13px]")}>
      <span
        className={clsx(
          "font-semibold tracking-[-0.01em]",
          claro ? "text-white" : "text-ink-950",
        )}
      >
        {t.nombre}
      </span>

      {detalle && (
        <span
          className={clsx(
            "mt-0.5 block text-[12.5px]",
            claro ? "text-white/60" : "text-stone-500",
          )}
        >
          {detalle}
        </span>
      )}
    </figcaption>
  );
}

export function Testimonios() {
  const [principal, ...resto] = TESTIMONIOS;

  if (!principal) {
    return null;
  }

  return (
    <section id="testimonios" className="bg-cream-100/50 py-24 sm:py-32">
      <Container>
        <Reveal>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-sun-600">
                <span aria-hidden className="h-px w-6 bg-sun-600/50" />
                Testimonios
              </span>

              <h2 className="mt-5 text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.035em] text-ink-950 sm:text-4xl md:text-[2.75rem]">
                Voces del ecosistema energético
              </h2>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <figure className="mt-14 overflow-hidden rounded-[2rem] bg-ink-950 text-white shadow-[0_30px_80px_-45px_rgba(15,23,42,0.55)] lg:grid lg:grid-cols-[0.9fr_1.1fr]">
            <Retrato t={principal} grande />

            <div className="flex flex-col justify-between p-8 sm:p-10 lg:p-12">
              <div>
                <blockquote className="mt-6 text-balance text-lg font-medium leading-[1.5] tracking-[-0.015em] sm:text-xl lg:text-[1.45rem]">
                  “{principal.cita}”
                </blockquote>
              </div>

              <div className="mt-10 flex items-center gap-3.5 border-t border-white/15 pt-6">
                <Retrato t={principal} />
                <Firma t={principal} compacto claro />
              </div>
            </div>
          </figure>
        </Reveal>

        {resto.length > 0 && (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {resto.map((t, index) => (
              <Reveal key={t.nombre} delay={0.12 + index * 0.06}>
                <figure className="flex h-full flex-col justify-between rounded-[1.75rem] bg-white p-7 ring-1 ring-ink-950/8 transition-shadow duration-300 hover:shadow-[0_20px_50px_-35px_rgba(15,23,42,0.45)] sm:p-8">
                  <blockquote className="text-[16px] leading-[1.7] text-ink-900/85">
                    “{t.cita}”
                  </blockquote>

                  <div className="mt-8 flex items-center gap-3.5 border-t border-ink-950/8 pt-6">
                    <Retrato t={t} />
                    <Firma t={t} compacto />
                  </div>
                </figure>
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}