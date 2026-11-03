"use client";

import { useMemo, useState } from "react";
import { Building2, CheckCheck, MessageCircle, RotateCcw, Sun, User } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import { formatCOPMiles, formatDecimal, formatNumber } from "@/lib/format";
import { getSessionId } from "@/lib/session";
import {
  armarMensajeContacto,
  permisoParaDestino,
  proveedorDelDestino,
  referenciaParaContacto,
  type DatosCotizacion,
  type DestinoCotizacion,
} from "@/lib/cotizacion-contacto";
export type { DatosCotizacion };
import { buildWhatsAppLink, WHATSAPP_NUMBER_DISPLAY } from "@/lib/whatsapp";
import { anios } from "./ProveedorCard";
import { PedirContacto } from "./PedirContacto";

function Nodo({ icono, label, activo }: { icono: React.ReactNode; label: string; activo: boolean }) {
  return (
    <div className="flex w-20 flex-col items-center gap-1.5 text-center">
      <span
        className={clsx(
          "flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-300",
          activo ? "border-ink-900 bg-white text-ink-900" : "border-ink-950/15 bg-white text-ink-950/30"
        )}
      >
        {icono}
      </span>
      <span className={clsx("text-[11px] font-semibold leading-tight", activo ? "text-ink-950" : "text-ink-950/35")}>
        {label}
      </span>
    </div>
  );
}

function Enlace({ activo }: { activo: boolean }) {
  return (
    <span aria-hidden className="relative mt-[22px] h-0 flex-1">
      <span
        className={clsx(
          "absolute inset-x-0 top-0 border-t-2 transition-colors duration-300",
          activo ? "border-solid border-leaf-500" : "border-dashed border-ink-950/20"
        )}
      />
    </span>
  );
}

/** Autorización con un dibujo de a dónde va la información: tú, SolarIA, proveedor. */
function Autorizacion({
  destino,
  autorizado,
  onCambiar,
}: {
  destino: DestinoCotizacion;
  autorizado: boolean;
  onCambiar: (v: boolean) => void;
}) {
  const proveedor = permisoParaDestino(destino);
  return (
    <div className="rounded-xl border border-ink-950/10 p-5">
      <div className="flex items-start" aria-hidden>
        <Nodo icono={<User className="h-5 w-5" />} label="Tú" activo />
        <Enlace activo />
        <Nodo icono={<Sun className="h-5 w-5" />} label="SolarIA" activo />
        <Enlace activo={autorizado} />
        <Nodo icono={<Building2 className="h-5 w-5" />} label={proveedorDelDestino(destino) ?? "Proveedor"} activo={autorizado} />
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={autorizado}
        onClick={() => onCambiar(!autorizado)}
        className="mt-5 flex w-full items-start gap-3 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-sun-500/50"
      >
        <span
          className={clsx(
            "mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200",
            autorizado ? "bg-leaf-500" : "bg-ink-950/15"
          )}
        >
          <span
            className={clsx(
              "h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
              autorizado && "translate-x-5"
            )}
          />
        </span>
        <span className="text-sm leading-relaxed text-ink-900/85">
          Opcional: autorizo que SolarIA comparta mis datos y mi número de WhatsApp con {proveedor} para gestionar una cotización. Puedes contactarnos sin activar esta opción.
        </span>
      </button>
    </div>
  );
}

/** Vista previa del mensaje, como se verá en el chat. */
function VistaChat({ mensaje }: { mensaje: string }) {
  return (
    <figure className="overflow-hidden rounded-xl border border-ink-950/10">
      <div className="flex items-center gap-3 bg-ink-900 px-4 py-3 text-white">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sun-500">
          <Sun className="h-4 w-4" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Agente SolarIA</p>
          <p className="text-[11px] text-white/55">{WHATSAPP_NUMBER_DISPLAY}</p>
        </div>
      </div>
      <div className="bg-cream-200/60 px-4 py-5">
        <div className="ml-auto max-w-[92%] rounded-lg rounded-tr-sm bg-white px-3.5 py-2.5 shadow-[0_1px_0_rgba(17,22,31,0.06)]">
          <p className="whitespace-pre-line text-[12.5px] leading-relaxed text-ink-950">{mensaje}</p>
          <p className="mt-1 flex items-center justify-end gap-1 text-[10px] text-ink-800/40">
            ahora <CheckCheck className="h-3 w-3" />
          </p>
        </div>
      </div>
      <figcaption className="border-t border-ink-950/8 bg-white px-4 py-2.5 text-[11px] text-ink-800/55">
        Así se verá tu mensaje. Puedes cambiarlo antes de enviarlo.
      </figcaption>
    </figure>
  );
}

export function StepQuote({ destino, datos, onBack, onReset, onAbrirWhatsApp }: {
  destino: DestinoCotizacion;
  datos: DatosCotizacion;
  onBack: () => void;
  onReset: () => void;
  onAbrirWhatsApp: (ref: string) => void;
}) {
  const [autorizado, setAutorizado] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const ref = useMemo(() => `SIA-${getSessionId().replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase()}`, []);
  const mensaje = armarMensajeContacto(destino, datos, autorizado, ref);
  const proveedor = proveedorDelDestino(destino);
  const oferta = destino.tipo === "oferta" ? destino.oferta : undefined;
  const referencia = referenciaParaContacto(destino, datos);

  return (
    <div>
      <h3 data-step-title tabIndex={-1} className="text-lg font-bold text-ink-950 outline-none">Tu cotización con SolarIA</h3>
      <p className="mt-1 max-w-[62ch] text-sm leading-relaxed text-ink-800/60">
        {proveedor ? `Revisaremos contigo la opción de ${proveedor}, su atención en tu zona y los pasos para cotizar.` : "Te ayudamos a revisar tu solución y encontrar un proveedor que pueda atender tu negocio."} Escríbenos por WhatsApp o déjanos tu celular y te contactamos.
      </p>

      <dl className="mt-6 grid grid-cols-1 gap-4 border-y border-ink-950/8 py-4 sm:grid-cols-3">
        {oferta?.ppa && referencia ? <>
          <div><dt className="text-[11px] text-ink-800/55">Inversión del escenario PPA</dt><dd className="mt-1 font-semibold text-ink-950">{formatCOPMiles(0)}</dd></div>
          <div><dt className="text-[11px] text-ink-800/55">Pago mensual de referencia</dt><dd className="mt-1 font-semibold text-ink-950">{formatCOPMiles(oferta.ppa.pagoMensual)}</dd></div>
          <div><dt className="text-[11px] text-ink-800/55">Ahorro mensual de referencia</dt><dd className="mt-1 font-semibold text-ink-950">{formatCOPMiles(oferta.ahorroMensual)}</dd></div>
        </> : referencia ? <>
          <div><dt className="text-[11px] text-ink-800/55">Inversión de referencia</dt><dd className="mt-1 font-semibold text-ink-950">{formatCOPMiles(referencia.inversion)}</dd></div>
          <div><dt className="text-[11px] text-ink-800/55">Ahorro energético inicial al mes</dt><dd className="mt-1 font-semibold text-ink-950">{formatCOPMiles(referencia.ahorroMensual)}</dd></div>
          <div><dt className="text-[11px] text-ink-800/55">Retorno de referencia</dt><dd className="mt-1 font-semibold text-ink-950">{anios(referencia.retornoMeses)}</dd></div>
        </> : <>
          <div><dt className="text-[11px] text-ink-800/55">Consumo mensual informado</dt><dd className="mt-1 font-semibold text-ink-950">{formatNumber(datos.consumoKwh)} kWh</dd></div>
          <div><dt className="text-[11px] text-ink-800/55">Base solar orientativa</dt><dd className="mt-1 font-semibold text-ink-950">{datos.kwp > 0 && datos.energia?.conexion !== "no_se" ? `≈ ${formatDecimal(datos.kwp)} kWp` : "Por definir"}</dd></div>
          <div><dt className="text-[11px] text-ink-800/55">Presupuesto</dt><dd className="mt-1 font-semibold text-ink-950">{datos.presupuestoFinanciero?.inversion !== null && datos.presupuestoFinanciero?.inversion !== undefined ? formatCOPMiles(datos.presupuestoFinanciero.inversion) : "Según evaluación técnica"}</dd></div>
        </>}
      </dl>
      {referencia && <p className="mt-2 text-xs leading-relaxed text-ink-800/55">Este es el escenario estimado en SolarIA. El proveedor definirá su propuesta al revisar tu caso.</p>}

      <div className="mt-6 grid items-start gap-5 md:grid-cols-2">
        <div>
          <Autorizacion destino={destino} autorizado={autorizado} onCambiar={setAutorizado} />
          <h4 className="mt-6 text-sm font-semibold text-ink-950">Qué pasa después</h4>
          <ol className="mt-2 space-y-2 text-sm leading-relaxed text-ink-800/70">
            <li>1. Nos escribes por WhatsApp o nos dejas tu celular para que te contactemos.</li>
            <li>2. Revisamos tus datos, la ubicación y la solución que necesitas.</li>
            <li>3. Te orientamos sobre disponibilidad, propuesta y visita técnica{proveedor ? ` para evaluar la opción de ${proveedor}` : " con un proveedor adecuado"}.</li>
          </ol>
        </div>
        <VistaChat mensaje={mensaje} />
      </div>

      {/* Dos caminos: escribir tú por WhatsApp o que SolarIA te contacte. */}
      <h4 className="mt-8 text-base font-bold text-ink-950">¿Cómo prefieres seguir?</h4>
      <div className="mt-3 grid items-start gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-ink-950/10 bg-white p-5">
          <p className="flex items-center gap-2 text-base font-bold text-ink-950">
            <MessageCircle className="h-5 w-5 text-ink-800" aria-hidden="true" />
            Escribir por WhatsApp
          </p>
          <p className="mt-1 text-sm text-ink-950/75">Te abrimos WhatsApp con el mensaje listo para enviarlo tú.</p>
          <div className="pt-4">
            <a href={buildWhatsAppLink(mensaje)} target="_blank" rel="noopener noreferrer"
              onClick={() => { setAbierto(true); onAbrirWhatsApp(ref); }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-sun-500 px-6 py-3 text-[0.95rem] font-semibold text-white transition-colors hover:bg-sun-600">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />Contactar a SolarIA por WhatsApp
            </a>
            <p className="mt-3 text-xs text-ink-800/50" aria-live="polite">
              {abierto ? `Abrimos WhatsApp en otra pestaña. Si no se abrió, escríbenos al ${WHATSAPP_NUMBER_DISPLAY}.` : "Se abre WhatsApp con el mensaje listo. Puedes revisarlo antes de enviarlo. Compartir datos con proveedores es opcional."}
            </p>
          </div>
        </div>
        <PedirContacto destino={destino} datos={datos} compartirConProveedor={autorizado} referencia={ref} />
      </div>

      <div className="mt-6">
        <Button type="button" variant="ghost" onClick={onBack}>Atrás</Button>
      </div>
      {abierto && <div className="mt-6 border-t border-ink-950/8 pt-5"><Button type="button" variant="ghost" onClick={onReset}><RotateCcw className="h-4 w-4" aria-hidden="true" />Empezar de nuevo</Button></div>}
    </div>
  );
}
