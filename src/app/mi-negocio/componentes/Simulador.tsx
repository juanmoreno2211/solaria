"use client";

import { useId, useState, useTransition } from "react";
import Link from "next/link";
import { formatCOP, formatDecimal } from "@/lib/format";
import { TEXTO_VEREDICTO } from "@/lib/negocio/opciones";
import { simular, type RespuestaSimulacion } from "../actions";
import { botonSecundario } from "./estilos";
import { CamposAparato, usoDesde, valoresDeCatalogo, type ValoresAparato } from "./CamposAparato";

/** "¿Y si agrego…?": no guarda el aparato. */
export function Simulador() {
  const idBase = useId();
  const [valores, setValores] = useState<ValoresAparato>(() => valoresDeCatalogo("aire"));
  const [respuesta, setRespuesta] = useState<RespuestaSimulacion | null>(null);
  const [pendiente, iniciar] = useTransition();

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          iniciar(async () => setRespuesta(await simular(usoDesde(valores))));
        }}
        className="space-y-4"
      >
        <CamposAparato valores={valores} onCambiar={(v) => { setValores(v); setRespuesta(null); }} idBase={idBase} />
        <button type="submit" className={`${botonSecundario} w-full sm:w-auto`} disabled={pendiente}>
          {pendiente ? "Calculando…" : "Simular"}
        </button>
      </form>

      <div aria-live="polite">
        {respuesta && !respuesta.ok && <p className="mt-4 text-sm text-ink-950/80">{respuesta.error}</p>}
        {respuesta?.ok && (
          <div className="mt-5 overflow-hidden rounded-2xl bg-ink-950 p-5 text-white">
            <p className="text-sm text-white/70">Tu recibo subiría (estimado)</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-sun-300 tabular-nums">
              +{formatCOP(Math.round(respuesta.resultado.costoExtra / 100) * 100)} al mes
            </p>
            <div className="mt-3 h-2.5 rounded-full bg-white/10" aria-hidden="true">
              <div className="h-full rounded-full bg-gradient-to-r from-sun-300 to-ember-500" style={{ width: `${Math.min(100, respuesta.resultado.porcentajeExtra)}%` }} />
            </div>
            <p className="mt-2 text-sm text-white/75">
              {formatDecimal(respuesta.resultado.porcentajeExtra)} % más · {formatDecimal(respuesta.resultado.kwhExtra)} kWh al mes
            </p>

            <div className="mt-4 border-t border-white/10 pt-4 text-sm">
              <p className="font-semibold text-white">¿Paneles solares?</p>
              {respuesta.resultado.cambia ? (
                <p className="mt-1 text-white/80">
                  Hoy: {TEXTO_VEREDICTO[respuesta.resultado.veredictoAntes]}. Con este aparato:{" "}
                  <span className="font-semibold text-sun-300">{TEXTO_VEREDICTO[respuesta.resultado.veredictoDespues]}</span>.
                </p>
              ) : (
                <p className="mt-1 text-white/80">No cambia: {TEXTO_VEREDICTO[respuesta.resultado.veredictoDespues]}.</p>
              )}
              <p className="mt-1 text-xs text-white/60">Mismo cálculo de la calculadora, con tu recibo y tu perfil guardados.</p>
              {respuesta.resultado.muestraCotizacion && (
                <div className="mt-3">
                  <Link
                    href="/#calculadora"
                    className="inline-flex min-h-11 items-center justify-center rounded-md bg-sun-400 px-5 text-sm font-bold text-ink-950 hover:bg-sun-300"
                  >
                    Pedir cotización
                  </Link>
                  <p className="mt-1 text-xs text-white/60">Te llevamos a la calculadora para elegir proveedor con tus datos.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
