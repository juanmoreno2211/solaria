import { getSessionId } from "./session";

export const EVENTOS = [
  "recibo_ingresado",
  "recibo_leido",
  "resultado_visto",
  "clic_pedir_cotizacion",
  "cotizacion_pedida",
  "interes_sin_proveedor",
] as const;

export type Evento = (typeof EVENTOS)[number];

/** Detalles sin datos personales: región, tipo de negocio, cifras, proveedor. */
export type DetalleEvento = Record<string, string | number | boolean | null | undefined>;

/** Registra un evento de la métrica. Nunca lanza ni interrumpe al usuario. */
export function registrarEvento(evento: Evento, detalle: DetalleEvento = {}): void {
  try {
    fetch("/api/eventos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: getSessionId(),
        evento,
        detalle,
        fecha: new Date().toISOString(),
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Ignorado a propósito: medir no puede romper la experiencia.
  }
}
