import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseEnv } from "./env";

/** Cliente para componentes de servidor, acciones y rutas. Actúa como el usuario de la sesión. */
export async function createClient() {
  // cookies() primero: marca la ruta como dinámica antes de cualquier otro fallo.
  const cookieStore = await cookies();
  const { url, key } = supabaseEnv();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Un componente de servidor no puede escribir cookies; proxy.ts ya renueva la sesión.
        }
      },
    },
  });
}
