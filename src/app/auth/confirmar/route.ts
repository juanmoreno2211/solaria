import { NextRequest, NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { rutaSegura } from "@/lib/supabase/redireccion";

/** Destino del enlace del correo de confirmación de cuenta. */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const tipo = searchParams.get("type") as EmailOtpType | null;
  const codigo = searchParams.get("code");
  const siguiente = rutaSegura(searchParams.get("siguiente"));

  // La plantilla por defecto de Supabase vuelve con ?code=; una personalizada puede usar token_hash.
  if (codigo || (tokenHash && tipo)) {
    const supabase = await createClient();
    const { error } = codigo
      ? await supabase.auth.exchangeCodeForSession(codigo)
      : await supabase.auth.verifyOtp({ type: tipo!, token_hash: tokenHash! });
    if (!error) return NextResponse.redirect(new URL(siguiente, request.url));
  }

  return NextResponse.redirect(new URL("/ingresar?error=enlace", request.url));
}
