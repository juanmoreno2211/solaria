import { MessageSquareQuote } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export function TrustSection() {
  return (
    <section className="border-t border-ink-950/8 py-14 sm:py-16">
      <Container>
        <Reveal>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex max-w-xl items-start gap-3">
              <MessageSquareQuote className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" strokeWidth={1.75} />
              <p className="text-sm leading-relaxed text-stone-600">
                <span className="font-semibold text-ink-950">
                  Apenas estamos empezando a construir esta comunidad.
                </span>{" "}
                Aún no tenemos testimonios ni aliados que mostrar — preferimos
                dejarlo así antes que inventarlos.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium">
              <a
                href={buildWhatsAppLink(
                  "¡Hola! Ya probé SolarIA y quiero contarles mi experiencia 🙂"
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sun-600 transition-colors hover:text-sun-700"
              >
                Comparte tu experiencia →
              </a>
              <a
                href={buildWhatsAppLink(
                  "¡Hola! Soy instalador/proveedor de energía solar y me interesa aparecer en SolarIA."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-500 transition-colors hover:text-ink-950"
              >
                ¿Eres proveedor? →
              </a>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
