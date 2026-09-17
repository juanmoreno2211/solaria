import { ArrowRight, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { buildWhatsAppLink, WHATSAPP_NUMBER_DISPLAY } from "@/lib/whatsapp";

export function CTA() {
  return (
    <section id="contacto" className="pb-24 sm:pb-28">
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-ink-gradient px-6 py-14 text-center sm:px-16 sm:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-sun-500/25 blur-[100px]"
          />
          <h2 className="relative text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Descubre tu ahorro solar antes de invertir un peso
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-balance text-white/65">
            Sube tu recibo, cuéntanos tu casa, negocio o finca, y deja que
            SolarIA calcule el plan de ahorro ideal para ti.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
                className="bg-white/5 text-white border-white/15 hover:bg-white/10"
              >
                <MessageCircle className="h-4 w-4" />
                Hablar por WhatsApp
              </Button>
            </a>
          </div>
          <p className="relative mt-5 text-sm text-white/40">
            O escríbenos directo al{" "}
            <span className="font-medium text-white/70">{WHATSAPP_NUMBER_DISPLAY}</span>
          </p>
        </div>
      </Container>
    </section>
  );
}
