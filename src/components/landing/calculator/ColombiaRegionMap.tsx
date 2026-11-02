"use client";

import { useId, useState } from "react";
import type { KeyboardEvent } from "react";
import map from "@/lib/geo/colombia-departments.json";
import { hspParaCalculo } from "@/lib/geo/departamentos";
import { CENTROS_DEPARTAMENTOS } from "@/lib/geo/centros-departamentos";

type Props = {
  departamento: string;
  onSelect: (departamento: string) => void;
};

/** Clases de sol, como en un atlas: cuatro rangos con un color cada uno. */
export const CLASES_SOL = [
  { desde: 3.3, hasta: 4.0, color: "#f3e9d8" },
  { desde: 4.0, hasta: 4.5, color: "#efd3a6" },
  { desde: 4.5, hasta: 5.0, color: "#e6b26c" },
  { desde: 5.0, hasta: 6.0, color: "#d48a36" },
];
const SELECCIONADO = "#11161f";
const RESALTADO = "#b9772f";

export function colorHsp(hsp: number): string {
  const clase = CLASES_SOL.find((c) => hsp < c.hasta) ?? CLASES_SOL[CLASES_SOL.length - 1];
  return clase.color;
}

const fmt = (n: number) => n.toLocaleString("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Geometría local: MapSVG / svg-maps, CC BY 4.0. Sin API de mapas, teselas ni permisos de ubicación. */
export function ColombiaRegionMap({ departamento, onSelect }: Props) {
  const titleId = useId();
  const [hovered, setHovered] = useState<string | null>(null);
  const islands = map.locations.find((location) => location.id === "sap");

  // San Andrés se marca en su recuadro ampliado, no en su posición real.
  const centro =
    departamento === islands?.name ? ([91, 72] as [number, number]) : CENTROS_DEPARTAMENTOS[departamento];
  const pin = centro ? { x: centro[0], y: centro[1] } : null;

  function keyboardSelect(event: KeyboardEvent<SVGElement>, department: string) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(department);
    }
  }

  function fill(department: string) {
    if (departamento === department) return SELECCIONADO;
    if (hovered === department) return RESALTADO;
    return colorHsp(hspParaCalculo(department) ?? CLASES_SOL[0].desde);
  }

  const hspElegido = hspParaCalculo(departamento);

  return (
    <div className="colombia-map">
      <svg
        viewBox={map.viewBox}
        role="group"
        aria-labelledby={titleId}
        className="colombia-map-svg"
        style={{ display: "block", width: "100%", maxHeight: 460, overflow: "visible" }}
      >
        <title id={titleId}>Mapa de Colombia por horas de sol pico. Elige tu departamento.</title>
        {map.locations.filter((location) => location.id !== "sap").map((location) => {
          const selected = departamento === location.name;
          return (
            <path
              key={location.id}
              id={`solar-map-${location.id}`}
              d={location.path}
              role="button"
              tabIndex={0}
              aria-pressed={selected}
              className={`map-department${selected ? " is-selected" : ""}`}
              fill={fill(location.name)}
              stroke="#fdfbf7"
              strokeWidth={1.2}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={{ cursor: "pointer", transition: "fill 160ms ease" }}
              onClick={() => onSelect(location.name)}
              onKeyDown={(event) => keyboardSelect(event, location.name)}
              onMouseEnter={() => setHovered(location.name)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(location.name)}
              onBlur={() => setHovered(null)}
            >
            </path>
          );
        })}
        {islands && (
          <g
            role="button"
            tabIndex={0}
            aria-pressed={departamento === islands.name}
            className="map-department map-islands"
            style={{ cursor: "pointer" }}
            onClick={() => onSelect(islands.name)}
            onKeyDown={(event) => keyboardSelect(event, islands.name)}
            onMouseEnter={() => setHovered(islands.name)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(islands.name)}
            onBlur={() => setHovered(null)}
          >
            <title>San Andrés y Providencia, ampliado y fuera de escala</title>
            <rect x={18} y={35} width={146} height={111} rx={4} fill="none" stroke={departamento === islands.name ? SELECCIONADO : "#c9c2b3"} strokeWidth={1} />
            <path d={islands.path} transform="translate(70 48) scale(9)" fill={fill(islands.name)} stroke="#9b7c52" strokeWidth={0.1} />
            <text x={91} y={118} textAnchor="middle" fill="#4b4943" fontSize={11} fontFamily="inherit">San Andrés y Providencia</text>
            <text x={91} y={133} textAnchor="middle" fill="#8a8071" fontSize={9} fontFamily="inherit">ampliado, fuera de escala</text>
          </g>
        )}

        {pin && hspElegido !== undefined && (() => {
          // Cerca del borde derecho, la etiqueta se dibuja hacia la izquierda.
          const lado = pin.x > 420 ? -1 : 1;
          const xEtiqueta = lado === 1 ? pin.x + 40 : pin.x - 144;
          return (
            <g pointerEvents="none" aria-hidden="true">
              <line x1={pin.x} y1={pin.y} x2={pin.x + lado * 46} y2={pin.y - 40} stroke={SELECCIONADO} strokeWidth={2.4} />
              <circle cx={pin.x} cy={pin.y} r={8} fill="#fdfbf7" stroke={SELECCIONADO} strokeWidth={3.5} />
              <rect x={xEtiqueta} y={pin.y - 70} width={104} height={40} rx={6} fill={SELECCIONADO} />
              <text x={xEtiqueta + 52} y={pin.y - 42} textAnchor="middle" fill="#fdfbf7" fontSize={23} fontWeight={600} fontFamily="inherit">
                {`${fmt(hspElegido)} h`}
              </text>
            </g>
          );
        })()}
      </svg>

      <figure style={{ margin: 0 }}>
        <figcaption style={{ fontSize: 11, color: "#6c6356", marginBottom: 6 }}>Horas de sol pico al día</figcaption>
        <ol style={{ display: "flex", gap: 4, listStyle: "none", padding: 0, margin: 0 }}>
          {CLASES_SOL.map((c) => (
            <li key={c.color} style={{ flex: 1 }}>
              <span style={{ display: "block", height: 10, background: c.color }} />
              <span style={{ display: "block", marginTop: 4, fontSize: 11, color: "#4b4943", fontVariantNumeric: "tabular-nums" }}>
                {fmt(c.desde)} a {fmt(c.hasta)}
              </span>
            </li>
          ))}
        </ol>
      </figure>
    </div>
  );
}