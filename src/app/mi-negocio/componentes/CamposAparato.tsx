"use client";

import clsx from "clsx";
import { CATALOGO_APARATOS, aparatoDelCatalogo, type TipoAparato } from "@/lib/aparatos/catalogo";
import { DIAS_MES_DEFECTO, kwhMes } from "@/lib/aparatos/calculo";
import { formatDecimal } from "@/lib/format";
import { ayuda, campo, etiqueta } from "./estilos";
import { IconoAparato } from "./iconos";
import { Plus } from "lucide-react";

export interface ValoresAparato {
  tipo: TipoAparato | "";
  nombre: string;
  cantidad: string;
  potenciaW: string;
  factorPct: string;
  horasDia: string;
  diasMes: string;
  kwhAnioEtiqueta: string;
}

export function valoresDeCatalogo(tipo: TipoAparato, cantidad = "1"): ValoresAparato {
  const a = aparatoDelCatalogo(tipo)!;
  return {
    tipo,
    nombre: a.nombre,
    cantidad,
    potenciaW: String(a.potenciaW),
    factorPct: String(Math.round(a.factorCiclo * 100)),
    horasDia: String(a.horasDia),
    diasMes: String(DIAS_MES_DEFECTO),
    kwhAnioEtiqueta: "",
  };
}

export const VALORES_VACIOS: ValoresAparato = {
  tipo: "",
  nombre: "",
  cantidad: "1",
  potenciaW: "",
  factorPct: "100",
  horasDia: "",
  diasMes: String(DIAS_MES_DEFECTO),
  kwhAnioEtiqueta: "",
};

const n = (v: string) => {
  const x = Number(v.replace(",", "."));
  return Number.isFinite(x) && x >= 0 ? x : 0;
};

export function usoDesde(v: ValoresAparato) {
  return {
    nombre: v.nombre || "Aparato",
    tipo: v.tipo || null,
    cantidad: Math.max(1, Math.round(n(v.cantidad))),
    potenciaW: n(v.potenciaW),
    factorCiclo: Math.min(1, Math.max(0.01, n(v.factorPct) / 100)),
    horasDia: Math.min(24, n(v.horasDia)),
    diasMes: Math.min(31, Math.max(1, n(v.diasMes) || DIAS_MES_DEFECTO)),
    kwhAnioEtiqueta: n(v.kwhAnioEtiqueta) || null,
  };
}

/** ¿Sigue con los valores del catálogo? Entonces se marca como valor de referencia. */
export function esDeReferencia(v: ValoresAparato): boolean {
  const a = v.tipo ? aparatoDelCatalogo(v.tipo) : undefined;
  if (!a || v.kwhAnioEtiqueta) return false;
  return n(v.potenciaW) === a.potenciaW && n(v.factorPct) === Math.round(a.factorCiclo * 100) && n(v.horasDia) === a.horasDia;
}

/**
 * Elegir del catálogo y ajustar: el usuario toca un aparato y solo corrige lo
 * que sepa. El nombre de los campos coincide con lo que leen las acciones.
 */
export function CamposAparato({
  valores,
  onCambiar,
  idBase,
  conCatalogo = true,
}: {
  valores: ValoresAparato;
  onCambiar: (v: ValoresAparato) => void;
  idBase: string;
  /** false cuando el aparato ya se eligió en la cuadrícula de íconos. */
  conCatalogo?: boolean;
}) {
  const catalogo = valores.tipo ? aparatoDelCatalogo(valores.tipo) : undefined;
  const set = (campoNombre: keyof ValoresAparato) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onCambiar({ ...valores, [campoNombre]: e.target.value });
  const kwh = kwhMes(usoDesde(valores));
  const conEtiqueta = Boolean(n(valores.kwhAnioEtiqueta));

  return (
    <div className="space-y-4">
      <input type="hidden" name="tipo_catalogo" value={valores.tipo} />
      {conCatalogo && (
      <fieldset>
        <legend className={etiqueta}>Elige el aparato</legend>
        <div className="flex flex-wrap gap-2">
          {CATALOGO_APARATOS.map((a) => {
            return (
            <button
              key={a.tipo}
              type="button"
              aria-pressed={valores.tipo === a.tipo}
              onClick={() => onCambiar(valoresDeCatalogo(a.tipo, valores.cantidad))}
              className={clsx(
                "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
                valores.tipo === a.tipo
                  ? "border-sun-600 bg-sun-500/10 text-ink-950"
                  : "border-ink-950/15 bg-white text-ink-950/80 hover:border-ink-950/30"
              )}
            >
              <IconoAparato tipo={a.tipo} className="h-4 w-4" aria-hidden="true" />
              {a.nombre}
            </button>
            );
          })}
          <button
            type="button"
            aria-pressed={valores.tipo === ""}
            onClick={() => onCambiar({ ...VALORES_VACIOS, cantidad: valores.cantidad })}
            className={clsx(
              "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
              valores.tipo === "" ? "border-sun-600 bg-sun-500/10 text-ink-950" : "border-ink-950/15 bg-white text-ink-950/80 hover:border-ink-950/30"
            )}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Otro
          </button>
        </div>
      </fieldset>
      )}

      {catalogo?.generaEnergia ? (
        <p className="rounded-lg bg-cream-100 p-3 text-sm text-ink-950/80">{catalogo.fuente}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <label className="col-span-2">
              <span className={etiqueta}>Nombre</span>
              <input id={`${idBase}-nombre`} name="nombre" required maxLength={120} value={valores.nombre} onChange={set("nombre")} className={campo} />
            </label>
            <label>
              <span className={etiqueta}>Cantidad</span>
              <input name="cantidad" inputMode="numeric" value={valores.cantidad} onChange={set("cantidad")} className={campo} />
            </label>
            <label>
              <span className={etiqueta}>Horas al día</span>
              <input name="horas_dia" inputMode="decimal" value={valores.horasDia} onChange={set("horasDia")} readOnly={conEtiqueta} className={clsx(campo, conEtiqueta && "bg-ink-950/5 text-ink-950/70")} />
            </label>
            <label className="col-span-2 sm:col-span-1">
              <span className={etiqueta}>Potencia (W)</span>
              <input name="potencia_w" inputMode="decimal" value={valores.potenciaW} onChange={set("potenciaW")} readOnly={conEtiqueta} className={clsx(campo, conEtiqueta && "bg-ink-950/5 text-ink-950/70")} />
            </label>
          </div>
          <details className="rounded-lg border border-ink-950/10 px-3 py-1">
            <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold text-ink-950">Ajustar más (opcional)</summary>
            <div className="grid grid-cols-2 gap-3 pb-3 pt-1">
              <label>
                <span className={etiqueta}>Trabaja a plena potencia (%)</span>
                <input name="factor_pct" inputMode="numeric" value={valores.factorPct} onChange={set("factorPct")} readOnly={conEtiqueta} className={clsx(campo, conEtiqueta && "bg-ink-950/5 text-ink-950/70")} />
              </label>
              <label>
                <span className={etiqueta}>Días al mes</span>
                <input name="dias_mes" inputMode="numeric" value={valores.diasMes} onChange={set("diasMes")} className={campo} />
              </label>
              <label className="col-span-2">
                <span className={etiqueta}>Etiqueta energética (kWh al año)</span>
                <input name="kwh_anio_etiqueta" inputMode="decimal" value={valores.kwhAnioEtiqueta} onChange={set("kwhAnioEtiqueta")} className={campo} />
                <span className={ayuda + " block"}>Si la escribes, manda sobre potencia × horas.</span>
              </label>
            </div>
          </details>

          <div className="rounded-lg bg-cream-100 p-3 text-sm text-ink-950/85">
            <p>
              <span className="font-semibold">≈ {formatDecimal(kwh)} kWh al mes</span> (estimado)
              {esDeReferencia(valores) && <span className="ml-1 inline-block whitespace-nowrap rounded bg-white px-1.5 py-0.5 text-xs font-semibold text-ink-950">valor de referencia</span>}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
