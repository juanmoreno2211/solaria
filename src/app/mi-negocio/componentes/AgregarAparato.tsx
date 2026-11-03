"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";
import type { TipoAparato } from "@/lib/aparatos/catalogo";
import { guardarAparato } from "../actions";
import { AvisoInvitar } from "./AvisoInvitar";
import { CamposAparato, VALORES_VACIOS, valoresDeCatalogo, type ValoresAparato } from "./CamposAparato";
import { IconoAparato } from "./iconos";
import { botonPrimario, botonSecundario } from "./estilos";

/** Cuadrícula de inicio: los aparatos más comunes con nombres cortos. */
const CUADRICULA: { tipo: TipoAparato | ""; nombre: string }[] = [
  { tipo: "nevera", nombre: "Nevera" },
  { tipo: "congelador", nombre: "Congelador" },
  { tipo: "aire", nombre: "Aire" },
  { tipo: "computador", nombre: "Computador o caja" },
  { tipo: "camaras", nombre: "Cámara" },
  { tipo: "luces", nombre: "Bombillo" },
  { tipo: "ventilador", nombre: "Ventilador" },
  { tipo: "datafono", nombre: "Datáfono" },
  { tipo: "", nombre: "Otro" },
];

/** Agregar un aparato: elegir un ícono y ajustar solo lo que sepas. */
export function AgregarAparato({ hayAparatos }: { hayAparatos: boolean }) {
  const idBase = useId();
  const [abierto, setAbierto] = useState(!hayAparatos);
  const [valores, setValores] = useState<ValoresAparato | null>(null);
  const [agregado, setAgregado] = useState(false);
  const elegir = (tipo: TipoAparato | "") => setValores(tipo ? valoresDeCatalogo(tipo) : { ...VALORES_VACIOS });

  if (!abierto) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={() => { setAbierto(true); setAgregado(false); }} className={`${botonPrimario} min-h-12 w-full text-base`}>
          <Plus className="h-5 w-5" aria-hidden="true" />
          Agregar aparato
        </button>
        {agregado && <AvisoInvitar />}
      </div>
    );
  }

  if (!valores) {
    return (
      <div>
        <p className="text-base font-bold text-ink-950">{hayAparatos ? "¿Qué aparato quieres agregar?" : "Elige un aparato para empezar"}</p>
        <ul className="mt-3 grid grid-cols-3 gap-2.5">
          {CUADRICULA.map((a) => (
            <li key={a.nombre}>
              <button
                type="button"
                onClick={() => elegir(a.tipo)}
                className="flex min-h-24 w-full flex-col items-center justify-center gap-2 rounded-xl border border-ink-950/12 bg-white p-2 text-center text-sm font-semibold text-ink-950 transition-colors hover:border-sun-500 hover:bg-sun-500/5 focus-visible:border-sun-500"
              >
                {a.tipo ? (
                  <IconoAparato tipo={a.tipo} className="h-8 w-8 text-ink-800" strokeWidth={1.6} aria-hidden="true" />
                ) : (
                  <Plus className="h-8 w-8 text-ink-800" strokeWidth={1.6} aria-hidden="true" />
                )}
                <span className="leading-tight">{a.nombre}</span>
              </button>
            </li>
          ))}
        </ul>
        {hayAparatos && (
          <button type="button" onClick={() => setAbierto(false)} className={`${botonSecundario} mt-3 w-full`}>
            Cancelar
          </button>
        )}
      </div>
    );
  }

  return (
    <form
      action={async (formData) => {
        await guardarAparato(formData);
        setValores(null);
        setAbierto(false);
        setAgregado(true);
      }}
      className="space-y-4 rounded-xl border border-ink-950/10 bg-cream-50 p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-base font-bold text-ink-950">
          <IconoAparato tipo={valores.tipo} className="h-6 w-6 text-ink-800" aria-hidden="true" />
          {valores.nombre || "Otro aparato"}
        </p>
        <button type="button" onClick={() => setValores(null)} className="min-h-11 px-2 text-sm font-semibold text-ink-950 underline underline-offset-4">
          Cambiar
        </button>
      </div>
      <CamposAparato valores={valores} onCambiar={setValores} idBase={idBase} conCatalogo={false} />
      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="submit" className={`${botonPrimario} min-h-12 sm:flex-1`}>Guardar aparato</button>
        <button type="button" onClick={() => { setValores(null); setAbierto(!hayAparatos); }} className={botonSecundario}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
