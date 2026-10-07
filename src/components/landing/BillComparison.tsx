import { ArrowRight, ReceiptText, Sun } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

export function BillComparison() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <Reveal>
          <div className="rounded-xl border border-ink-950/8 bg-white p-6 sm:p-10">
            <div className="grid items-center gap-8 sm:grid-cols-[1fr_auto_1fr] sm:divide-x sm:divide-ink-950/8">
              <div className="text-center sm:pr-8 sm:text-left">
                <span className="mx-auto flex items-center gap-2 text-ember-600 sm:mx-0">
                  <ReceiptText className="h-4 w-4" />
                  <span className="text-xs font-semibold tracking-wide uppercase">
                    Sin energía solar
                  </span>
                </span>
                <p className="tabular-nums mt-4 text-4xl font-bold text-ink-950">
                  $ 240.000
                  <span className="text-base font-medium text-stone-500">/mes</span>
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  Factura promedio de una casa en Colombia
                </p>
              </div>

              <div className="hidden items-center justify-center px-2 sm:flex">
                <ArrowRight className="h-5 w-5 text-ink-950/30" />
              </div>

              <div className="text-center sm:pl-8 sm:text-left">
                <span className="mx-auto flex items-center gap-2 text-leaf-700 sm:mx-0">
                  <Sun className="h-4 w-4" />
                  <span className="text-xs font-semibold tracking-wide uppercase">
                    Con energía solar
                  </span>
                </span>
                <p className="tabular-nums mt-4 text-4xl font-bold text-ink-950">
                  $ 36.000
                  <span className="text-base font-medium text-stone-500">/mes</span>
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  Con un sistema de paneles bien dimensionado (≈85% de ahorro)
                </p>
              </div>
            </div>

            <p className="mt-7 border-t border-ink-950/8 pt-5 text-center text-xs text-stone-500">
              Ejemplo ilustrativo. Sube tu propio recibo en la calculadora para ver tu ahorro real.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
