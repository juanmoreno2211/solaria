import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizarCodigo } from "./codigo";

export type RegistrarEvento = (
  supabase: SupabaseClient,
  evento: "invitado_registrado",
  detalle: Record<string, string>
) => Promise<void>;

/**
 * Asocia la cuenta recién creada a la invitación. La función de Postgres usa
 * auth.uid() de la sesión: aquí nunca se pasa un id de usuario, así que nadie
 * puede asociar a otra persona. Solo registra el evento si la base de datos
 * aceptó la atribución.
 */
export async function atribuirInvitacion(
  supabase: SupabaseClient,
  codigoCrudo: unknown,
  registrar: RegistrarEvento
): Promise<boolean> {
  const codigo = normalizarCodigo(codigoCrudo);
  if (!codigo) return false;

  const { data, error } = await supabase.rpc("atribuir_invitacion", { p_codigo: codigo });
  if (error) {
    console.error("[invitaciones] no se pudo atribuir", error.message);
    return false;
  }
  if (data !== true) return false;

  await registrar(supabase, "invitado_registrado", { codigo });
  return true;
}
