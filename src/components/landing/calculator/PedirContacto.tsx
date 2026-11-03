"use client";

import { useId, useState } from "react";
import { CheckCircle2, PhoneCall } from "lucide-react";
import clsx from "clsx";
import { getSessionId } from "@/lib/session";
import { registrarEvento } from "@/lib/eventos";
import { validarPedidoContacto, type ErroresContacto, type PedidoContactoInput } from "@/lib/cotizacion";
import { proveedorDelDestino, referenciaParaContacto, type DatosCotizacion, type DestinoCotizacion } from "@/lib/cotizacion-contacto";

const campo =
  "min-h-11 w-full rounded-lg border bg-white px-3.5 py-2.5 text-base text-ink-950 outline-none transition-colors placeholder:text-ink-950/45 focus:border-sun-500 focus:ring-2 focus:ring-sun-500/15 sm:text-sm";

/**
 * La otra opción junto a WhatsApp: deja nombre y celular y el equipo de
 * SolarIA te escribe. Se guarda en la hoja de solicitudes (no en la cuenta).
 */
export function PedirContacto({
  destino,
  datos,
  compartirConProveedor,
  referencia,
}: {
  destino: DestinoCotizacion;
  datos: DatosCotizacion;
  compartirConProveedor: boolean;
  referencia: string;
}) {
  const id = useId();
  const [nombre, setNombre] = useState("");
  const [celular, setCelular] = useState("");
  const [consentimiento, setConsentimiento] = useState(false);
  const [errores, setErrores] = useState<ErroresContacto>({});
  const [estado, setEstado] = useState<"listo" | "enviando" | "enviado" | "error">("listo");
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const encontrados = validarPedidoContacto({ nombre, celular, consentimiento });
    setErrores(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setEstado("enviando");
    setMensajeError(null);
    const oferta = destino.tipo === "oferta" ? destino.oferta : undefined;
    const ref = referenciaParaContacto(destino, datos);
    const cuerpo: PedidoContactoInput = {
      sessionId: getSessionId(),
      ref: referencia,
      proveedor: proveedorDelDestino(destino) ?? null,
      plan: oferta?.plan?.nombre ?? null,
      oferta: oferta?.tipoOferta ?? null,
      nombre,
      celular,
      municipio: datos.municipio,
      consentimiento,
      compartirConProveedor,
      negocio: { tipo: datos.tipoNegocio, departamento: datos.departamento, horario: datos.horario, conexion: datos.conexion },
      estimado: {
        consumoKwh: datos.consumoKwh,
        valorFactura: datos.valorFactura,
        kwp: datos.kwp,
        ahorroMensual: ref?.ahorroMensual,
        inversion: ref?.inversion,
        retornoMeses: ref?.retornoMeses ?? null,
      },
    };
    try {
      const res = await fetch("/api/solicitar-contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (json.errores) setErrores(json.errores);
        setMensajeError(json.error ?? "No pudimos enviar tu solicitud. Intenta de nuevo.");
        setEstado("error");
        return;
      }
      setEstado("enviado");
      registrarEvento("contacto_pedido", {
        proveedor: cuerpo.proveedor ?? "Orientación SolarIA",
        oferta: cuerpo.oferta ?? "consulta",
        compartirConProveedor,
        ref: referencia,
      });
    } catch {
      setMensajeError("No pudimos conectar con el servidor. Intenta de nuevo o escríbenos por WhatsApp.");
      setEstado("error");
    }
  }

  if (estado === "enviado") {
    return (
      <div role="status" className="flex flex-col items-start gap-2 rounded-xl border border-leaf-600/30 bg-leaf-500/10 p-5">
        <CheckCircle2 className="h-6 w-6 text-leaf-700" aria-hidden="true" />
        <p className="text-base font-bold text-ink-950">Listo, {nombre.trim().split(" ")[0]}.</p>
        <p className="text-sm text-ink-950/85">
          El equipo de SolarIA te contactará al {celular.trim()} para revisar tu cotización. Tu referencia es {referencia}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate className="rounded-xl border border-ink-950/10 bg-white p-5">
      <p className="flex items-center gap-2 text-base font-bold text-ink-950">
        <PhoneCall className="h-5 w-5 text-ink-800" aria-hidden="true" />
        Quiero que me contacten
      </p>
      <p className="mt-1 text-sm text-ink-950/75">Déjanos tu nombre y tu celular y te escribimos nosotros.</p>

      <div className="mt-4 space-y-3">
        <div>
          <label htmlFor={`${id}-nombre`} className="mb-1.5 block text-sm font-semibold text-ink-950">Nombre</label>
          <input
            id={`${id}-nombre`}
            autoComplete="name"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            aria-invalid={Boolean(errores.nombre)}
            aria-describedby={errores.nombre ? `${id}-e-nombre` : undefined}
            className={clsx(campo, errores.nombre ? "border-red-600" : "border-ink-950/15")}
          />
          {errores.nombre && <p id={`${id}-e-nombre`} className="mt-1 text-xs font-medium text-red-700">{errores.nombre}</p>}
        </div>
        <div>
          <label htmlFor={`${id}-celular`} className="mb-1.5 block text-sm font-semibold text-ink-950">Celular</label>
          <input
            id={`${id}-celular`}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="310 123 4567"
            value={celular}
            onChange={(e) => setCelular(e.target.value)}
            aria-invalid={Boolean(errores.celular)}
            aria-describedby={errores.celular ? `${id}-e-celular` : undefined}
            className={clsx(campo, errores.celular ? "border-red-600" : "border-ink-950/15")}
          />
          {errores.celular && <p id={`${id}-e-celular`} className="mt-1 text-xs font-medium text-red-700">{errores.celular}</p>}
        </div>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-ink-950/85">
          <input
            type="checkbox"
            checked={consentimiento}
            onChange={(e) => setConsentimiento(e.target.checked)}
            aria-invalid={Boolean(errores.consentimiento)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-ink-950"
          />
          <span>
            Autorizo que SolarIA me escriba o me llame a este número para ayudarme con mi cotización.
            {errores.consentimiento && <span className="mt-1 block text-xs font-medium text-red-700">{errores.consentimiento}</span>}
          </span>
        </label>
      </div>

      {mensajeError && <p role="alert" className="mt-3 text-sm font-medium text-red-700">{mensajeError}</p>}

      <button
        type="submit"
        disabled={estado === "enviando"}
        className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-ink-950 px-6 text-[0.95rem] font-semibold text-white transition-colors hover:bg-ink-800 disabled:opacity-60"
      >
        <PhoneCall className="h-4 w-4" aria-hidden="true" />
        {estado === "enviando" ? "Enviando…" : "Pedir que me contacten"}
      </button>
    </form>
  );
}
