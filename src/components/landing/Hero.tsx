"use client";

import { motion } from "framer-motion";
import { ArrowRight, Store } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

const RESPUESTAS = [
  "Cuánto ahorrarías al mes en la factura",
  "Cuánto cuesta instalar los paneles",
  "En cuánto tiempo recuperas la inversión",
  "Qué proveedor de tu región te puede cotizar",
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
            Para micronegocios en Colombia
          </span>

          <h1 className="mt-7 text-balance font-bold leading-[1.05] tracking-tight text-white">
            <span className="block text-3xl font-medium text-white/65 sm:text-4xl">
              ¿Le conviene la energía solar
            </span>
            <span className="mt-1 block text-5xl sm:text-6xl md:text-[4rem]">
              a <span className="text-sun-400">tu negocio</span>?
            </span>
          </h1>

          <p className="mt-7 max-w-md text-balance text-lg leading-relaxed text-white/60">
            Si la luz te falla y la factura pesa, con los datos de tu recibo
            sabrás en un par de minutos si te conviene instalar paneles solares.
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
            <span>Tiendas, restaurantes, consultorios, talleres y fincas</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.12 }}
          className="relative"
        >
          <div className="overflow-hidden rounded-xl bg-white/[0.035] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.65)]">
            <div className="flex items-center gap-2 border-b border-white/8 px-6 py-3.5 text-white/60 sm:px-7">
              <Store className="h-3.5 w-3.5" />
              <span className="text-xs font-medium tracking-wide uppercase">
                Lo que vas a saber de tu negocio
              </span>
            </div>

            <ol className="divide-y divide-white/10 p-6 sm:p-7">
              {RESPUESTAS.map((r, i) => (
                <li key={r} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                  <span className="tabular-nums text-sm font-semibold text-sun-400">
                    {i + 1}
                  </span>
                  <span className="text-sm text-white/80">{r}</span>
                </li>
              ))}
            </ol>
          </div>

          <p className="mt-3 text-center text-xs text-white/30">
            Y si no te conviene, también te lo decimos.
          </p>
        </motion.div>
      </Container>
    </section>
  );
}
