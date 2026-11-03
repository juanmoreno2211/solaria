import { createClient } from "@supabase/supabase-js";
import { supabaseEnv } from "@/lib/supabase/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Consulta mínima a Supabase con la clave publicable: cuenta filas de
 * negocios sin traerlas. Sin sesión, la RLS deja ver 0 filas, pero la consulta
 * confirma que Supabase responde y que la tabla existe.
 */
export async function GET() {
  const inicio = Date.now();
  try {
    const { url, key } = supabaseEnv();
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { error } = await supabase.from("negocios").select("id", { head: true, count: "exact" }).limit(1);
    if (error) {
      console.error("[health] Supabase respondió con error", error.message);
      return Response.json({ ok: false, supabase: "error" }, { status: 503 });
    }
    return Response.json({ ok: true, supabase: "ok", ms: Date.now() - inicio });
  } catch (e) {
    console.error("[health] no se pudo consultar Supabase", e);
    return Response.json({ ok: false, supabase: "sin_conexion" }, { status: 503 });
  }
}
