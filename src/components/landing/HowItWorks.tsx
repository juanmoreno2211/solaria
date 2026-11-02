import { ArrowUp, HardHat, MessageCircle, ReceiptText } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { ImagenSubida } from "@/components/ui/ImagenSubida";
import { SolDelArco } from "./SolDelArco";

interface Paso {
  /** Ilustración en /public, sin extensión. Ver docs/imagenes.md. */
  imagen: string;
  titulo: string;
  texto: string;
  Icono: typeof ReceiptText;
}

function pasos(fotoDisponible: boolean): Paso[] {
  return [
    {
      imagen: "imagenes/como-funciona/recibo",
      titulo: "Calcula tu ahorro",
      texto: fotoDisponible
        ? "Sube una foto de tu recibo de luz y responde unas preguntas rápidas."
        : "Ingresa los datos de tu recibo de luz y responde unas preguntas rápidas.",
      Icono: ReceiptText,
    },
    {
      imagen: "imagenes/como-funciona/whatsapp",
      titulo: "Escríbenos por WhatsApp",
      texto:
        "Elige un proveedor y escríbenos por WhatsApp. Organizamos el contacto por ti.",
      Icono: MessageCircle,
    },
    {
      imagen: "imagenes/como-funciona/visita",
      titulo: "Recibe tu precio final",
      texto:
        "El instalador visita tu negocio, revisa tu techo y te entrega el precio final.",
      Icono: HardHat,
    },
  ];
}

/**
 * El recorrido completo, del recibo a la visita técnica. Un arco de sol une
 * los tres momentos en pantallas grandes. Los detalles de cada paso viven en
 * la calculadora y en las preguntas frecuentes; aquí solo va lo esencial.
 */
export function HowItWorks({ fotoDisponible }: { fotoDisponible: boolean }) {
  const lista = pasos(fotoDisponible);

  return (
    <section id="como-funciona" className="bg-cream-100/50 py-24 pb-28 sm:py-28 sm:pb-32">
      <Container>
        <h2 className="inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-sun-600">
          <span aria-hidden className="h-px w-6 bg-sun-600/50" />
          Cómo funciona
        </h2>
        <Reveal>
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <h2 className="max-w-[18ch] text-balance text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-ink-950 sm:text-4xl md:text-[2.75rem]">
              De tu recibo a la visita del instalador
            </h2>
            <p className="max-w-md text-base leading-relaxed text-stone-600 sm:text-lg lg:justify-self-end">
              Solo necesitas tu recibo de luz y tu WhatsApp.
            </p>
          </div>
        </Reveal>

        <div className="relative mt-14 md:mt-20 md:pt-16">
          {/* Arco del sol: amanece en el primer paso, está en lo alto en el segundo. */}
          <div aria-hidden className="pointer-events-none absolute inset-x-[16.6%] top-0 z-10 hidden h-16 md:block">
            <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="h-full w-full overflow-visible">
              <path
                d="M0 20 Q50 -18 100 20"
                fill="none"
                stroke="#d9842b"
                strokeOpacity="0.45"
                strokeWidth="1.5"
                strokeDasharray="2 6"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <SolDelArco />
            <span className="absolute bottom-[-4px] left-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-sun-500" />
            <span className="absolute bottom-[-4px] right-0 h-2.5 w-2.5 translate-x-1/2 rounded-full bg-sun-500" />
          </div>

          <ol className="grid gap-12 md:grid-cols-3 md:gap-8">
            {lista.map((paso, i) => (
              <li key={paso.titulo}>
                <ImagenSubida
                  base={paso.imagen}
                  sizes="(min-width: 768px) 30vw, 90vw"
                  className="aspect-[4/3] rounded-2xl bg-cream-200/70"
                  respaldo={<paso.Icono className="h-14 w-14 text-sun-500/70" strokeWidth={1.25} />}
                />
                <div className="mt-6 flex gap-4">
                  <span className="text-3xl font-semibold leading-none tracking-[-0.04em] text-sun-500 tabular-nums">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold leading-snug text-ink-950">{paso.titulo}</h3>
                    <p className="mt-1.5 max-w-[38ch] text-sm leading-relaxed text-stone-600">{paso.texto}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-14 flex justify-center">
          <a
            href="#calculadora"
            className="inline-flex items-center gap-2 rounded-md border border-ink-950/15 px-5 py-2.5 text-sm font-semibold text-ink-950 transition-colors hover:border-ink-950/30 hover:bg-white"
          >
            <ArrowUp className="h-4 w-4" />
            Calcular mi ahorro
          </a>
        </div>
      </Container>
    </section>
  );
}