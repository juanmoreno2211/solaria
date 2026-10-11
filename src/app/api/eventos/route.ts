import { NextRequest } from "next/server";
import { EVENTOS, type Evento } from "@/lib/eventos";
import { enviarAHoja } from "@/lib/sheets";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { sessionId?: unknown; evento?: unknown; detalle?: unknown; fecha?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  if (!EVENTOS.includes(body.evento as Evento) || typeof body.sessionId !== "string") {
    return new Response(null, { status: 400 });
  }

  const detalle =
    body.detalle && typeof body.detalle === "object" ? JSON.stringify(body.detalle) : "{}";

  const ok = await enviarAHoja("eventos", [
    new Date().toISOString(),
    body.sessionId.slice(0, 64),
    body.evento as string,
    detalle.slice(0, 2000),
  ]);
  if (!ok) console.error("[eventos] no se pudo guardar el evento", body.evento);

  // El navegador ignora la respuesta; un fallo aquí nunca debe afectar al usuario.
  return new Response(null, { status: 204 });
}
