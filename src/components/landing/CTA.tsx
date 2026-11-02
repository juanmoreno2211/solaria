import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { buscarImagen } from "@/lib/imagenes";
import {
  buildWhatsAppLink,
  WHATSAPP_NUMBER_DISPLAY,
} from "@/lib/whatsapp";

const IMAGEN_FINAL = "imagenes/cta/cta2";

export function CTA() {
  const imagen = buscarImagen(IMAGEN_FINAL);

  return (
    <section
      id="contacto"
      className="relative isolate overflow-hidden bg-ink-gradient py-24 sm:py-28 lg:py-32"
    >
      {imagen && (
        <>
          <Image
            src={imagen.src}
            alt=""
            fill
            sizes="100vw"
            unoptimized={imagen.esSvg}
            className="object-cover object-center"
          />

          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(10,14,22,0.90) 0%, rgba(10,14,22,0.72) 55%, rgba(10,14,22,0.48) 100%)",
            }}
          />
        </>
      )}

      <Container className="relative z-10">
        <Reveal className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-sun-200">
            <span aria-hidden="true" className="h-px w-6 bg-sun-300/60" />
            Da el siguiente paso
            <span aria-hidden="true" className="h-px w-6 bg-sun-300/60" />
          </span>

          <h2
            className="
              mt-6 text-balance
              text-[clamp(2.25rem,4vw,3.5rem)]
              font-semibold leading-[1.08]
              tracking-[-0.045em] text-white
            "
          >
            Antes de invertir,
            <span className="block text-sun-300">
              conoce tu potencial de ahorro.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-[34rem] text-base leading-[1.75] text-white/85 sm:text-lg">
            Comienza con la información de tu recibo de luz y descubre si la
            energía solar conviene para tu negocio. Nuestro equipo puede
            acompañarte en cada paso.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/#calculadora">
              <Button size="lg" className="w-full sm:w-auto">
                Calcular mi ahorro
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <a
              href={buildWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex min-h-11 w-full items-center justify-center gap-2
                rounded-lg border border-white/25 px-5 py-3
                text-sm font-medium text-white/85
                transition-colors duration-200
                hover:border-white/45 hover:text-white
                sm:w-auto
              "
            >
              <MessageCircle className="h-4 w-4" />
              Hablar con un asesor
            </a>
          </div>

          <p className="mt-8 text-sm text-white/45">
            También puedes contactarnos al{" "}
            <span className="font-medium text-white/80 tabular-nums">
              {WHATSAPP_NUMBER_DISPLAY}
            </span>
          </p>
        </Reveal>
      </Container>
    </section>
  );
}