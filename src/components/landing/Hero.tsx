"use client";

import { motion } from "framer-motion";
import { ArrowRight, Store } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

const RESPUESTAS = [
  "Cuánto podrías ahorrar al mes en tu factura de energía",
  "Cuánto podría costar instalar paneles solares",
  "En cuánto tiempo podrías recuperar la inversión",
  "Qué proveedores de tu región puedes contactar",
];

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-ink-gradient pt-16 pb-20 sm:pt-20 sm:pb-28"
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
      >
        <source src="/videos/inicio.mp4" type="video/mp4" />
      </video>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(10,14,22,0.88) 0%, rgba(10,14,22,0.64) 55%, rgba(10,14,22,0.30) 100%)",
        }}
      />

      <Container className="relative grid gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-sun-200">
            <span className="h-px w-6 bg-sun-300/60" />
            Para micronegocios colombianos
          </span>

          <h1
            className="
              mt-6 max-w-[680px]
              text-[clamp(2.75rem,4.8vw,4.5rem)]
              font-semibold leading-[1.08]
              tracking-[-0.045em] text-white
            "
          >
            <span className="block">¿Energía solar</span>

            <span className="block">
              para <span className="text-sun-300">tu negocio</span>?
            </span>
          </h1>

          <p
            className="
              mt-6 max-w-[30rem]
              text-base leading-[1.75]
              text-white/85 sm:text-lg
            "
          >Descubre cuánto podrías ahorrar, estima tu inversión y encuentra proveedores en tu región.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
          <a href="#calculadora">
            <Button size="lg" className="w-full sm:w-auto">
              Calcular mi ahorro
              <ArrowRight className="h-4 w-4" />
            </Button>
          </a>

          <Link
            href="/mi-negocio"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/40 px-6 py-3 text-[0.95rem] font-semibold text-white transition-colors hover:border-white/70 hover:bg-white/10"
          >
            Controla tu consumo
          </Link>

          <div className="flex items-center gap-8">
            <a
              href="#como-funciona"
              className="
                text-sm font-medium tracking-[-0.01em]
                text-white/65 transition-colors duration-200
                hover:text-white
              "
            >
              Cómo funciona
            </a>

            <a
              href="#preguntas"
              className="
                text-sm font-medium tracking-[-0.01em]
                text-white/85 transition-colors duration-200
                hover:text-white
              "
            >
              Preguntas frecuentes
            </a>
          </div>
        </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/40">
            <span>Gratis · Tu ahorro estimado en segundos</span>
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
                Lo que podrás conocer
              </span>
            </div>

            <ol className="divide-y divide-white/10 p-6 sm:p-7">
              {RESPUESTAS.map((r, i) => (
                <li
                  key={r}
                  className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0"
                >
                  <span className="tabular-nums text-sm font-semibold text-sun-400">
                    {i + 1}
                  </span>
                  <span className="text-sm text-white/80">{r}</span>
                </li>
              ))}
            </ol>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}