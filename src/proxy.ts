import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseEnv } from "@/lib/supabase/env";

const RUTAS_PRIVADAS = ["/mi-negocio"];

/** Renueva la sesión de Supabase en cada visita y saca a quien no tenga sesión de las rutas privadas. */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const esPrivada = RUTAS_PRIVADAS.some((ruta) => pathname.startsWith(ruta));

  let env: ReturnType<typeof supabaseEnv>;
  try {
    env = supabaseEnv();
  } catch {
    // Sin Supabase configurado la calculadora sigue funcionando; lo privado queda cerrado.
    return esPrivada ? redirigirAIngreso(request) : NextResponse.next();
  }
  const { url, key } = env;
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getClaims valida el token; no confiar en getSession dentro del servidor.
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims && esPrivada) return redirigirAIngreso(request);

  return response;
}

function redirigirAIngreso(request: NextRequest) {
  const destino = request.nextUrl.clone();
  destino.pathname = "/ingresar";
  // Conserva la query (p. ej. ?invitar=1) para volver al mismo lugar después de ingresar.
  destino.search = `?siguiente=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`;
  return NextResponse.redirect(destino);
}

export const config = {
  // Solo páginas: fuera estáticos, imágenes y rutas /api.
  matcher: ["/((?!api|_next/static|_next/image|imagenes|videos|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)"],
};
