"use client";

import { motion } from "framer-motion";
import { ArrowRight, FileScan } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

const DESGLOSE = [
  { label: "Paneles", value: "68%" },
  { label: "Iluminación", value: "9%" },
  { label: "Refrigeración", value: "5%" },
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-ink-gradient pt-16 pb-24 sm:pt-20 sm:pb-28">
      <Container className="relative grid gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.14em] text-sun-300 uppercase">
            <span className="h-px w-6 bg-sun-300/60" />
            Agente de energía solar con IA
          </span>

          <h1 className="mt-7 text-balance font-bold leading-[1.05] tracking-tight text-white">
            <span className="block text-3xl font-medium text-white/65 sm:text-4xl">
              Descubre cuánto puedes
            </span>
            <span className="mt-1 block text-5xl sm:text-6xl md:text-[4rem]">
              ahorrar en{" "}
              <span className="text-sun-400">dinero y energía</span>
            </span>
          </h1>

          <p className="mt-7 max-w-md text-balance text-lg leading-relaxed text-white/60">
            Sube tu recibo y deja que un agente con IA compare paneles,
            iluminación y refrigeración solar por ti.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href="#calculadora">
              <Button size="lg" className="w-full sm:w-auto">
                Calcular mi ahorro gratis
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <a href="#como-funciona">
              <Button
                size="lg"
                variant="ghost"
                className="w-full text-white/70 hover:bg-white/5 hover:text-white sm:w-auto"
              >
                Ver cómo funciona
              </Button>
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/40">
            <span>Sin costo · Resultados en minutos</span>
            <span className="hidden h-3 w-px bg-white/15 sm:block" />
            <span>Pensado para casas, negocios y fincas en Colombia</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.12 }}
          className="relative"
        >
          <div className="overflow-hidden rounded-xl bg-white/[0.035] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.65)]">
            <div className="flex items-center justify-between border-b border-white/8 px-6 py-3.5 sm:px-7">
              <div className="flex items-center gap-2 text-white/60">
                <FileScan className="h-3.5 w-3.5" />
                <span className="text-xs font-medium tracking-wide uppercase">
                  Tu recibo, analizado
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-medium text-leaf-400">
                <span className="h-1.5 w-1.5 rounded-full bg-leaf-400" />
                Análisis IA
              </span>
            </div>

            <div className="p-6 sm:p-7">
            <div className="divide-y divide-white/10 border-y border-white/10">
              <div className="flex items-center justify-between py-3 text-sm">
                <span className="text-white/45">Consumo mensual</span>
                <span className="tabular-nums font-medium text-white">312 kWh</span>
              </div>
              <div className="flex items-center justify-between py-3 text-sm">
                <span className="text-white/45">Valor pagado</span>
                <span className="tabular-nums font-medium text-white">$ 264.000</span>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs tracking-wide text-white/40 uppercase">
                Ahorro potencial estimado
              </p>
              <p className="tabular-nums mt-2 text-5xl font-bold text-white">
                82<span className="align-top text-2xl text-sun-400">%</span>
              </p>
              <p className="mt-1 text-sm text-white/45">≈ $ 216.000 cada mes</p>
            </div>

            <div className="mt-7 grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 pt-5">
              {DESGLOSE.map((item) => (
                <div key={item.label} className="px-3 text-center first:pl-0 last:pr-0">
                  <p className="tabular-nums text-sm font-semibold text-white">
                    {item.value}
                  </p>
                  <p className="mt-1 text-[11px] text-white/40">{item.label}</p>
                </div>
              ))}
            </div>
            </div>
          </div>

          <p className="mt-3 text-center text-xs text-white/30">
            Ejemplo ilustrativo. Tus resultados se calculan con tus datos reales.
          </p>
        </motion.div>
      </Container>
    </section>
  );
}
