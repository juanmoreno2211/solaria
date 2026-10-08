"use client";

import { useState } from "react";
import { HORAS_SOL_PICO, type Region } from "@/lib/config/pricing";

const REGION_INFO: Record<Region, { nombre: string; blurb: string }> = {
  caribe: {
    nombre: "Caribe",
    blurb:
      "La región con más horas de sol de Colombia — ideal para sistemas solares de alto rendimiento.",
  },
  insular: {
    nombre: "Insular",
    blurb:
      "San Andrés y Providencia también gozan de un excelente recurso solar todo el año.",
  },
  orinoquia: {
    nombre: "Orinoquía",
    blurb:
      "Los Llanos Orientales tienen gran potencial solar, con amplias extensiones para sistemas grandes.",
  },
  andina: {
    nombre: "Andina",
    blurb:
      "La región más poblada del país; menos horas de sol que la costa, pero sigue siendo muy viable.",
  },
  amazonia: {
    nombre: "Amazonía",
    blurb:
      "Mayor nubosidad reduce el rendimiento solar, aunque sigue siendo alternativa frente a la falta de red.",
  },
  pacifico: {
    nombre: "Pacífico",
    blurb:
      "La región con menos horas de sol pico del país, por su alta nubosidad y lluvias.",
  },
};

const CELDAS: { region: Region | null; area: string }[] = [
  { region: null, area: "a1" },
  { region: "caribe", area: "a2" },
  { region: "caribe", area: "a3" },
  { region: "insular", area: "a4" },
  { region: "pacifico", area: "b1" },
  { region: "andina", area: "b2" },
  { region: "andina", area: "b3" },
  { region: "orinoquia", area: "b4" },
  { region: "pacifico", area: "c1" },
  { region: "andina", area: "c2" },
  { region: "andina", area: "c3" },
  { region: "orinoquia", area: "c4" },
  { region: null, area: "d1" },
  { region: "amazonia", area: "d2" },
  { region: "amazonia", area: "d3" },
  { region: null, area: "d4" },
];

const HSP_MAXIMO = 6.5;

function colorPorHsp(hsp: number): string {
  const t = Math.min(1, hsp / HSP_MAXIMO);
  if (t > 0.85) return "#e2a152";
  if (t > 0.7) return "#d9842b";
  if (t > 0.55) return "#b56a1d";
  return "#8a5016";
}

export function ColombiaMap() {
  const [activa, setActiva] = useState<Region>("caribe");
  const info = REGION_INFO[activa];
  const hsp = HORAS_SOL_PICO[activa];

  return (
    <div className="border-t border-white/10 pt-10">
      <p className="text-sm font-semibold text-white">
        Mapa solar de Colombia por región
      </p>
      <p className="mt-1 text-xs text-white/45">
        Toca una región para ver sus horas de sol pico (HSP) promedio.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-8 sm:grid-cols-[1fr_1fr]">
        <div
          className="grid aspect-square gap-1.5"
          style={{
            gridTemplateAreas:
              '"a1 a2 a3 a4" "b1 b2 b3 b4" "c1 c2 c3 c4" "d1 d2 d3 d4"',
            gridTemplateColumns: "repeat(4, 1fr)",
            gridTemplateRows: "repeat(4, 1fr)",
          }}
        >
          {CELDAS.map(({ region, area }) => {
            if (!region) return <div key={area} style={{ gridArea: area }} />;
            const esActiva = region === activa;
            return (
              <button
                key={area}
                type="button"
                style={{
                  gridArea: area,
                  backgroundColor: colorPorHsp(HORAS_SOL_PICO[region]),
                }}
                onMouseEnter={() => setActiva(region)}
                onClick={() => setActiva(region)}
                aria-label={REGION_INFO[region].nombre}
                className={`rounded-md transition-all duration-150 ${
                  esActiva
                    ? "opacity-100 ring-2 ring-white/80 ring-offset-2 ring-offset-ink-950"
                    : "opacity-70 hover:opacity-95"
                }`}
              />
            );
          })}
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-sun-300">
            {info.nombre}
          </p>
          <p className="mt-1 text-3xl font-bold text-white">
            {hsp.toFixed(1)} <span className="text-base font-medium text-white/50">HSP</span>
          </p>
          <p className="mt-2 text-xs leading-relaxed text-white/55">
            {info.blurb}
          </p>
        </div>
      </div>
    </div>
  );
}
