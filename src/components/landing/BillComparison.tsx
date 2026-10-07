import { ArrowRight, ReceiptText, Sun } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

export function BillComparison() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <Reveal>
          <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.03)] sm:p-10">
            <div className="grid items-center gap-6 sm:grid-cols-[1fr_auto_1fr]">
              <div className="rounded-2xl border border-ember-500/20 bg-ember-500/5 p-6 text-center sm:text-left">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-ember-500/15 text-ember-600 sm:mx-0">
                  <ReceiptText className="h-5 w-5" />
                </span>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ember-600">
                  Sin energía solar
                </p>
                <p className="mt-1 text-4xl font-bold text-ink-950">
                  $ 240.000
                  <span className="text-base font-medium text-ink-800/50">/mes</span>
                </p>
                <p className="mt-1 text-xs text-ink-800/45">
                  Factura promedio de una casa en Colombia
                </p>
              </div>

              <div className="flex items-center justify-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-950 text-white">
                  <ArrowRight className="h-5 w-5 rotate-90 sm:rotate-0" />
                </span>
              </div>

              <div className="rounded-2xl border border-leaf-500/25 bg-leaf-500/6 p-6 text-center sm:text-left">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-sun-gradient text-ink-950 sm:mx-0">
                  <Sun className="h-5 w-5" />
                </span>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-leaf-700">
                  Con energía solar
                </p>
                <p className="mt-1 text-4xl font-bold text-ink-950">
                  $ 36.000
                  <span className="text-base font-medium text-ink-800/50">/mes</span>
                </p>
                <p className="mt-1 text-xs text-ink-800/45">
                  Con un sistema de paneles bien dimensionado (≈85% de ahorro)
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-ink-800/40">
              Ejemplo ilustrativo. Sube tu propio recibo en la calculadora para ver tu ahorro real.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
