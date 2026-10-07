"use client";

import { motion } from "framer-motion";
import { ArrowRight, FileScan, PiggyBank, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-ink-gradient pt-14 pb-24 sm:pt-20 sm:pb-32">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-[-10%] h-[420px] w-[420px] rounded-full bg-sun-500/20 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-10%] left-[-5%] h-[380px] w-[380px] rounded-full bg-leaf-500/15 blur-[120px]"
      />

      <Container className="relative grid gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-sun-300">
            <Sparkles className="h-3.5 w-3.5" />
            Agente de energía solar con IA
          </span>

          <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl">
            Sube tu recibo de luz y descubre cuánto puedes{" "}
            <span className="bg-sun-gradient bg-clip-text text-transparent">
              ahorrar con energía solar
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-balance text-lg text-white/65 sm:text-xl">
            Sube tu recibo y descubre en minutos cuánto puedes ahorrar en
            paneles, iluminación o refrigeración solar.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="#calculadora">
              <Button size="lg" className="w-full sm:w-auto">
                Calcular mi ahorro gratis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <a href="#como-funciona">
              <Button size="lg" variant="secondary" className="w-full bg-white/5 text-white border-white/15 hover:bg-white/10 sm:w-auto">
                Ver cómo funciona
              </Button>
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-white/50">
            <span>Sin costo · Resultados en minutos</span>
            <span className="hidden h-1 w-1 rounded-full bg-white/30 sm:block" />
            <span>Pensado para casas, negocios y fincas en Colombia</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="relative"
        >
          <div className="card-glow relative rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm sm:p-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div className="flex items-center gap-2.5 text-white">
                <FileScan className="h-5 w-5 text-sun-400" />
                <span className="text-sm font-semibold">Tu recibo, analizado</span>
              </div>
              <span className="rounded-full bg-leaf-500/15 px-2.5 py-1 text-xs font-semibold text-leaf-400">
                Análisis IA
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-sm text-white/60">
                <span>Consumo mensual</span>
                <span className="font-semibold text-white">312 kWh</span>
              </div>
              <div className="flex items-center justify-between text-sm text-white/60">
                <span>Valor pagado</span>
                <span className="font-semibold text-white">$ 264.000</span>
              </div>

              <div className="h-px w-full bg-white/10" />

              <div className="flex items-center gap-4 rounded-2xl bg-white/5 p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sun-gradient">
                  <PiggyBank className="h-5 w-5 text-ink-950" />
                </span>
                <div>
                  <p className="text-xs text-white/50">Ahorro potencial estimado</p>
                  <p className="text-2xl font-bold text-white">
                    82% <span className="text-base font-medium text-white/50">· $ 216.000/mes</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1">
                {[
                  { label: "Paneles", value: "68%" },
                  { label: "Iluminación", value: "9%" },
                  { label: "Refrigeración", value: "5%" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-center"
                  >
                    <p className="text-sm font-bold text-sun-300">{item.value}</p>
                    <p className="mt-1 text-[11px] text-white/45">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-3 text-center text-xs text-white/35">
            Ejemplo ilustrativo. Tus resultados se calculan con tus datos reales.
          </p>
        </motion.div>
      </Container>
    </section>
  );
}
