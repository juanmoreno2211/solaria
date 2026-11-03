"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function texto(formData: FormData, campo: string, max = 120): string | null {
  const valor = String(formData.get(campo) ?? "").trim().slice(0, max);
  return valor || null;
}

function numero(formData: FormData, campo: string): number | null {
  const valor = Number(String(formData.get(campo) ?? "").replace(",", "."));
  return Number.isFinite(valor) && valor >= 0 && String(formData.get(campo) ?? "").trim() ? valor : null;
}

/** Cliente con sesión; user_id lo pone la base de datos y la RLS lo verifica. */
async function clienteConSesion() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/ingresar?siguiente=/mi-negocio");
  return supabase;
}

export async function guardarNegocio(formData: FormData) {
  const supabase = await clienteConSesion();
  const nombre = texto(formData, "nombre");
  if (!nombre) return;

  const { error } = await supabase.from("negocios").upsert(
    {
      nombre,
      tipo_negocio: texto(formData, "tipo_negocio", 80),
      departamento: texto(formData, "departamento", 80),
      municipio: texto(formData, "municipio", 80),
      consumo_kwh_mes: numero(formData, "consumo_kwh_mes"),
      valor_recibo: numero(formData, "valor_recibo"),
    },
    { onConflict: "user_id" }
  );
  if (error) console.error("[mi-negocio] no se pudo guardar el negocio", error.message);
  revalidatePath("/mi-negocio");
}

export async function agregarAparato(formData: FormData) {
  const supabase = await clienteConSesion();
  const negocioId = texto(formData, "negocio_id", 64);
  const nombre = texto(formData, "nombre");
  if (!negocioId || !nombre) return;

  const { error } = await supabase.from("aparatos").insert({
    negocio_id: negocioId,
    nombre,
    cantidad: Math.max(1, Math.round(numero(formData, "cantidad") ?? 1)),
    potencia_w: numero(formData, "potencia_w"),
    horas_dia: Math.min(24, numero(formData, "horas_dia") ?? 0) || null,
  });
  if (error) console.error("[mi-negocio] no se pudo agregar el aparato", error.message);
  revalidatePath("/mi-negocio");
}

export async function borrarAparato(formData: FormData) {
  const supabase = await clienteConSesion();
  const id = texto(formData, "id", 64);
  if (!id) return;
  const { error } = await supabase.from("aparatos").delete().eq("id", id);
  if (error) console.error("[mi-negocio] no se pudo borrar el aparato", error.message);
  revalidatePath("/mi-negocio");
}
