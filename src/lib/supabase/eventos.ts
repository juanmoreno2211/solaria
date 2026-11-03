import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type EventoCuenta =
  | "cuenta_creada"
  | "aparato_registrado"
  | "ranking_visto"
  | "resultado_guardado"
  | "invitacion_creada"
  | "invitado_registrado";
// invitacion_abierta no pasa por aquí: no hay sesión y lo guarda la función registrar_apertura.

/**
 * Guarda un evento de la cuenta. user_id lo pone la base de datos con
 * auth.uid() de la sesión del servidor; nunca viene del navegador.
 * Un fallo aquí no debe romper la acción del usuario.
 */
export async function registrarEventoCuenta(
  supabase: SupabaseClient,
  evento: EventoCuenta,
  detalle: Record<string, string | number | boolean | null> = {}
): Promise<void> {
  const { error } = await supabase.from("eventos").insert({ evento, detalle });
  if (error) console.error("[eventos] no se pudo guardar", evento, error.message);
}
