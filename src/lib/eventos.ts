import { getSessionId } from "./session";

export const EVENTOS = [
  "recibo_ingresado",
  "recibo_leido",
  "resultado_visto",
  "clic_pedir_cotizacion",
  "cotizacion_pedida",
  "interes_sin_proveedor",
  "whatsapp_abierto",
] as const;

export type Evento = (typeof EVENTOS)[number];

export type DetalleEvento = Record<string, string | number | boolean | null | undefined>;

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
  }
}