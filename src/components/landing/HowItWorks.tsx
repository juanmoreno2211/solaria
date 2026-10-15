import { Calculator, FileScan, Handshake } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const PASO_RECIBO_FOTO = {
  icon: FileScan,
  title: "Sube tu recibo y cuéntanos de tu negocio",
  description:
    "Toma una foto del recibo de luz o escribe el consumo y el valor a mano; si usas la foto, la leemos y tú confirmas los números. Luego nos dices qué tipo de negocio tienes, en qué región está, en qué horario trabajas y cómo te falla la luz.",
};

const PASO_RECIBO_MANUAL = {
  icon: FileScan,
  title: "Escribe tu recibo y cuéntanos de tu negocio",
  description:
    "Escribe el consumo o el valor del recibo de luz; con uno de los dos basta. Luego nos dices qué tipo de negocio tienes, en qué región está, en qué horario trabajas y cómo te falla la luz.",
};

const PASOS = [
  {
    icon: Calculator,
    title: "Mira si te conviene",
    description:
      "Calculamos cuánto ahorrarías con paneles solares y, con cada proveedor, cuánto costaría y en cuánto tiempo recuperas la inversión. Si no te conviene, te lo decimos.",
  },
  {
    icon: Handshake,
    title: "Pide tu cotización",
    description:
      "Si te interesa, elige un proveedor de tu región y deja tus datos. Con tu autorización, le pasamos tu solicitud con tu estimado para que te cotice.",
  },
];

export function HowItWorks({ fotoDisponible }: { fotoDisponible: boolean }) {
  const pasos = [fotoDisponible ? PASO_RECIBO_FOTO : PASO_RECIBO_MANUAL, ...PASOS];

  return (
    <section id="como-funciona" className="bg-cream-100/50 py-24 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Cómo funciona"
            title="De tu recibo a una cotización para tu negocio"
            description="En un par de minutos sabes si la energía solar le conviene a tu negocio y, si es así, quién te puede cotizar. No necesitas saber nada de paneles para empezar."
          />
        </Reveal>

        <div className="relative mt-16 grid gap-10 sm:grid-cols-3 sm:gap-6">
          <div
            aria-hidden
            className="absolute left-5 top-5 bottom-5 w-px bg-ink-950/10 sm:bottom-auto sm:left-0 sm:right-0 sm:h-px sm:w-auto"
          />
          {pasos.map((paso, i) => (
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
