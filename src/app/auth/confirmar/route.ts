import { NextRequest, NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { rutaSegura } from "@/lib/supabase/redireccion";
import { registrarEventoCuenta } from "@/lib/supabase/eventos";
import { atribuirInvitacion } from "@/lib/invitaciones/atribuir";

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
    if (!error) {
      // El enlace de confirmación solo se envía al registrarse.
      if (codigo || tipo === "signup" || tipo === "email") {
        await registrarEventoCuenta(supabase, "cuenta_creada");
        await atribuirInvitacion(supabase, searchParams.get("invitacion"), registrarEventoCuenta);
      }
      return NextResponse.redirect(new URL(siguiente, request.url));
    }
  }

  return NextResponse.redirect(new URL("/ingresar?error=enlace", request.url));
}
