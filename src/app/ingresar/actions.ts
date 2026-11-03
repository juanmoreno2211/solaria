"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { rutaSegura } from "@/lib/supabase/redireccion";

export type EstadoIngreso = { error?: string; mensaje?: string };

function leerCredenciales(formData: FormData) {
  const correo = String(formData.get("correo") ?? "").trim().toLowerCase();
  const contrasena = String(formData.get("contrasena") ?? "");
  return { correo, contrasena };
}

export async function ingresar(_: EstadoIngreso, formData: FormData): Promise<EstadoIngreso> {
  const { correo, contrasena } = leerCredenciales(formData);
  if (!correo || !contrasena) return { error: "Escribe tu correo y tu contraseña." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: correo, password: contrasena });
  if (error) {
    if (error.code === "email_not_confirmed") return { error: "Primero confirma tu correo con el enlace que te enviamos." };
    // Mismo mensaje para correo inexistente y contraseña errada: no revela qué cuentas existen.
    return { error: "Correo o contraseña incorrectos." };
  }

  redirect(rutaSegura(String(formData.get("siguiente") ?? "")));
}

export async function registrarse(_: EstadoIngreso, formData: FormData): Promise<EstadoIngreso> {
  const { correo, contrasena } = leerCredenciales(formData);
  if (!correo || !contrasena) return { error: "Escribe tu correo y una contraseña." };
  if (contrasena.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };

  const origen = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const siguiente = rutaSegura(String(formData.get("siguiente") ?? ""));

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: correo,
    password: contrasena,
    options: { emailRedirectTo: `${origen}/auth/confirmar?siguiente=${encodeURIComponent(siguiente)}` },
  });
  if (error) {
    if (error.code === "weak_password") return { error: "Esa contraseña es muy débil. Prueba con una más larga." };
    return { error: "No pudimos crear la cuenta. Intenta de nuevo." };
  }

  // Con confirmación de correo activa no hay sesión hasta abrir el enlace.
  if (!data.session) return { mensaje: "Te enviamos un correo. Abre el enlace para activar tu cuenta." };
  redirect(siguiente);
}

export async function salir() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/ingresar");
}
