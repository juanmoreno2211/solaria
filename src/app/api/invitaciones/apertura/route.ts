import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizarCodigo } from "@/lib/invitaciones/codigo";

export const runtime = "nodejs";

const COOKIE_VISITANTE = "solaria_visitante";
const UN_ANIO = 60 * 60 * 24 * 365;

/**
 * Cuenta la apertura de un enlace /i/[codigo]. Usa la clave publicable y la
 * sesión si la hay (así la función no cuenta al dueño); la cookie de
 * visitante evita contar dos veces el mismo navegador.
 */
export async function POST(req: NextRequest) {
  let body: { codigo?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  const codigo = normalizarCodigo(body.codigo);
  if (!codigo) return new Response(null, { status: 400 });

  const existente = req.cookies.get(COOKIE_VISITANTE)?.value;
  const visitante = existente && /^[0-9a-f-]{36}$/.test(existente) ? existente : crypto.randomUUID();

  const supabase = await createClient();
  const { error } = await supabase.rpc("registrar_apertura", { p_codigo: codigo, p_visitante: visitante });
  if (error) console.error("[invitaciones] no se pudo registrar la apertura", error.message);

  // La respuesta no dice si el código existe ni de quién es.
  const res = new Response(null, { status: 204 });
  if (visitante !== existente) {
    res.headers.append(
      "Set-Cookie",
      `${COOKIE_VISITANTE}=${visitante}; Path=/; Max-Age=${UN_ANIO}; HttpOnly; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`
    );
  }
  return res;
}
