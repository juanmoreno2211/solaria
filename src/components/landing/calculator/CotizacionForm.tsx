"use client";

import clsx from "clsx";
import { FieldLabel, TextInput } from "./ui";
import { Button } from "@/components/ui/Button";
import type { EstadoDatos } from "@/lib/catalog/types";
import type { ErroresSolicitante } from "@/lib/cotizacion";

export interface CotizacionFormState {
  nombre: string;
  telefono: string;
  municipio: string;
  consentimiento: boolean;
}

function ErrorCampo({ id, mensaje }: { id: string; mensaje?: string }) {
  if (!mensaje) return null;
  return (
    <p id={id} className="mt-1.5 text-xs font-medium text-red-700">
      {mensaje}
    </p>
  );
}

/** Mientras los datos del proveedor no estén confirmados, la solicitud la recibe el equipo. */
function textoAutorizacion(proveedor: string, estadoDatos: EstadoDatos): string {
  if (estadoDatos === "confirmado") {
    return `Autorizo compartir mi estimado y mis datos de contacto con ${proveedor} para que me cotice.`;
  }
  const destino = estadoDatos === "simulado" ? "un instalador" : proveedor;
  return `Autorizo que el equipo de SolarIA reciba mi estimado y mis datos de contacto, y que se los pase a ${destino} para que me cotice. Sin esta autorización no se los pasa a nadie.`;
}

export function CotizacionForm({
  proveedor,
  estadoDatos,
  value,
  onChange,
  errores,
  errorEnvio,
  enviando,
  onBack,
  onSubmit,
}: {
  proveedor: string;
  estadoDatos: EstadoDatos;
  value: CotizacionFormState;
  onChange: (v: CotizacionFormState) => void;
  errores: ErroresSolicitante;
  errorEnvio: string | null;
  enviando: boolean;
  onBack: () => void;
  onSubmit: () => void;
}) {
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel>Tu nombre</FieldLabel>
          <TextInput
            autoComplete="name"
            value={value.nombre}
            aria-invalid={Boolean(errores.nombre)}
            aria-describedby="err-nombre"
            onChange={(e) => onChange({ ...value, nombre: e.target.value })}
          />
          <ErrorCampo id="err-nombre" mensaje={errores.nombre} />
        </div>
        <div>
          <FieldLabel>Celular o WhatsApp</FieldLabel>
          <TextInput
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={value.telefono}
            aria-invalid={Boolean(errores.telefono)}
            aria-describedby="err-telefono"
            onChange={(e) => onChange({ ...value, telefono: e.target.value })}
          />
          <ErrorCampo id="err-telefono" mensaje={errores.telefono} />
        </div>
      </div>

      <div className="mt-4">
        <FieldLabel>Municipio del negocio</FieldLabel>
        <TextInput
          autoComplete="address-level2"
          value={value.municipio}
          aria-invalid={Boolean(errores.municipio)}
          aria-describedby="err-municipio"
          onChange={(e) => onChange({ ...value, municipio: e.target.value })}
        />
        <ErrorCampo id="err-municipio" mensaje={errores.municipio} />
      </div>

      <label
        className={clsx(
          "mt-5 flex cursor-pointer items-start gap-3 rounded-lg border p-4 text-sm text-ink-900/80",
          errores.consentimiento ? "border-red-300 bg-red-50/50" : "border-ink-950/10"
        )}
      >
        <input
          type="checkbox"
          checked={value.consentimiento}
          onChange={(e) => onChange({ ...value, consentimiento: e.target.checked })}
          aria-describedby="err-consentimiento"
          className="mt-0.5 h-4 w-4 shrink-0 accent-sun-500"
        />
        <span>{textoAutorizacion(proveedor, estadoDatos)}</span>
      </label>
      <ErrorCampo id="err-consentimiento" mensaje={errores.consentimiento} />

      <p className="mt-4 text-xs leading-relaxed text-ink-800/50">
        Usamos tus datos solo para gestionar esta solicitud de cotización y no
        los compartimos sin tu autorización. No guardamos la foto de tu recibo.
      </p>

      {errorEnvio && (
        <p role="alert" className="mt-4 text-sm font-medium text-red-700">
          {errorEnvio}
        </p>
      )}

      <div className="mt-7 flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={onBack} disabled={enviando}>
          Atrás
        </Button>
        <Button type="submit" disabled={enviando}>
          {enviando ? "Enviando..." : "Enviar solicitud"}
        </Button>
      </div>
    </form>
  );
}
