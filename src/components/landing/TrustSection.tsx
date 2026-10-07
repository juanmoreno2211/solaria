import { MessageSquareQuote, Store } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export function TrustSection() {
  return (
    <section className="py-24 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Confianza"
            title="Apenas estamos empezando a construir esta comunidad"
            description="Aún no tenemos testimonios ni aliados que mostrar — preferimos dejarlo vacío antes que inventarlos. Si ya probaste SolarIA o quieres ser de los primeros, este espacio es tuyo."
          />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-black/10 bg-cream-100/40 p-8 text-center"
              >
                <MessageSquareQuote className="h-6 w-6 text-ink-800/25" />
                <p className="text-sm text-ink-800/40">
                  Espacio reservado para un testimonio
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-black/5 bg-cream-100/70 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-sm text-ink-800/70">
            ¿Ya usaste SolarIA? Cuéntanos tu experiencia y sé de los primeros
            testimonios en aparecer aquí.
          </p>
          <a
            href={buildWhatsAppLink(
              "¡Hola! Ya probé SolarIA y quiero contarles mi experiencia 🙂"
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="md" variant="secondary">
              Compartir mi experiencia
            </Button>
          </a>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex h-16 items-center justify-center rounded-xl border-2 border-dashed border-black/10 text-ink-800/25"
            >
              <Store className="h-5 w-5" />
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-ink-800/45">
          ¿Eres instalador o proveedor de energía solar en Colombia?{" "}
          <a
            href={buildWhatsAppLink(
              "¡Hola! Soy instalador/proveedor de energía solar y me interesa aparecer en SolarIA."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-ink-800/70 underline underline-offset-2"
          >
            Hablemos de aparecer aquí
          </a>
          .
        </p>
      </Container>
    </section>
  );
}
