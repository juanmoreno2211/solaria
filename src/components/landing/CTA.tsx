import { ArrowRight, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { buildWhatsAppLink, WHATSAPP_NUMBER_DISPLAY } from "@/lib/whatsapp";

export function CTA() {
  return (
    <section id="contacto" className="bg-ink-gradient py-24 text-center sm:py-28">
      <Container>
        <Reveal>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Descubre tu ahorro solar antes de invertir un peso
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-balance text-white/60">
            Sube tu recibo, cuéntanos tu casa, negocio o finca, y deja que
            SolarIA calcule el plan de ahorro ideal para ti.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#calculadora">
              <Button size="lg">
                Calcular mi ahorro
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <a href={buildWhatsAppLink()} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                variant="secondary"
                className="border-white/15 text-white hover:bg-white/5"
              >
                <MessageCircle className="h-4 w-4" />
                Hablar por WhatsApp
              </Button>
            </a>
          </div>
          <p className="mt-6 text-sm text-white/35">
            O escríbenos directo al{" "}
            <span className="font-medium text-white/60">{WHATSAPP_NUMBER_DISPLAY}</span>
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
