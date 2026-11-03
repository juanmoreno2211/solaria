"use client";

import { useId, useState, useTransition } from "react";
import Link from "next/link";
import { formatCOP, formatDecimal } from "@/lib/format";
import { TEXTO_VEREDICTO } from "@/lib/negocio/opciones";
import { simular, type RespuestaSimulacion } from "../actions";
import { botonPrimario, botonSecundario } from "./estilos";
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
          <div className="mt-5 rounded-lg border border-ink-950/10 bg-cream-50 p-4">
            <p className="text-sm text-ink-950/70">Tu recibo subiría (estimado)</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-ink-950 tabular-nums">
              +{formatCOP(Math.round(respuesta.resultado.costoExtra / 100) * 100)} al mes
            </p>
            <p className="text-sm text-ink-950/70">
              {formatDecimal(respuesta.resultado.porcentajeExtra)} % más · {formatDecimal(respuesta.resultado.kwhExtra)} kWh al mes
            </p>

            <div className="mt-4 border-t border-ink-950/10 pt-4 text-sm">
              <p className="font-semibold text-ink-950">¿Paneles solares?</p>
              {respuesta.resultado.cambia ? (
                <p className="mt-1 text-ink-950/80">
                  Hoy: {TEXTO_VEREDICTO[respuesta.resultado.veredictoAntes]}. Con este aparato:{" "}
                  <span className="font-semibold text-ink-950">{TEXTO_VEREDICTO[respuesta.resultado.veredictoDespues]}</span>.
                </p>
              ) : (
                <p className="mt-1 text-ink-950/80">No cambia: {TEXTO_VEREDICTO[respuesta.resultado.veredictoDespues]}.</p>
              )}
              <p className="mt-1 text-xs text-ink-950/60">Mismo cálculo de la calculadora, con tu recibo y tu perfil guardados.</p>
              {respuesta.resultado.muestraCotizacion && (
                <div className="mt-3">
                  <Link
                    href="/#calculadora"
                    className={botonPrimario}
                  >
                    Pedir cotización
                  </Link>
                  <p className="mt-1 text-xs text-ink-950/60">Te llevamos a la calculadora para elegir proveedor con tus datos.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
