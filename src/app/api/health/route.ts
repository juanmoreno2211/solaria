import { createClient } from "@supabase/supabase-js";
import { supabaseEnv } from "@/lib/supabase/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Solo el nombre del servidor: nunca la URL completa ni la clave. */
function servidor(url: string | undefined): string {
  try {
    return url ? new URL(url).hostname : "(sin URL)";
  } catch {
    return "(URL inválida)";
  }
}

/** Código de red de Node (ENOTFOUND, ECONNREFUSED, ETIMEDOUT…), si lo hay. */
function codigoRed(e: unknown): string | undefined {
  const err = e as { code?: unknown; cause?: { code?: unknown } } | null;
  const code = err?.cause?.code ?? err?.code;
  return typeof code === "string" && code ? code : undefined;
}

/**
 * Consulta mínima a Supabase con la clave publicable: cuenta filas de
 * negocios sin traerlas. Sin sesión, la RLS deja ver 0 filas, pero la consulta
 * confirma que Supabase responde y que la tabla existe.
 */
export async function GET() {
  const inicio = Date.now();
  let host = servidor(process.env.NEXT_PUBLIC_SUPABASE_URL);
  // Supabase convierte los fallos de red en { error } y pierde error.cause;
  // envolvemos fetch para quedarnos con el código antes de que lo traduzca.
  let causa: string | undefined;
  const fetchConCausa: typeof fetch = async (...args) => {
    try {
      return await fetch(...args);
    } catch (e) {
      causa = codigoRed(e);
      throw e;
    }
  };
  try {
    const { url, key } = supabaseEnv();
    host = servidor(url);
    const supabase = createClient(url, key, {
      auth: { persistSession: false },
      global: { fetch: fetchConCausa },
    });
    const { error } = await supabase.from("negocios").select("id", { head: true, count: "exact" }).limit(1);
    if (error) {
      if (causa) {
        console.error(`[health] sin conexión con Supabase (${host}): ${causa}`);
        return Response.json({ ok: false, supabase: "sin_conexion" }, { status: 503 });
      }
      console.error(`[health] Supabase (${host}) respondió con error`, error.message);
      return Response.json({ ok: false, supabase: "error" }, { status: 503 });
    }
    return Response.json({ ok: true, supabase: "ok", ms: Date.now() - inicio });
  } catch (e) {
    const code = causa ?? codigoRed(e) ?? (e instanceof Error ? e.name : "desconocido");
    console.error(`[health] no se pudo consultar Supabase (${host}): ${code}`);
    return Response.json({ ok: false, supabase: "sin_conexion" }, { status: 503 });
  }
}
