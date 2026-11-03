"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { registrarEventoCuenta } from "@/lib/supabase/eventos";
import { datosDepartamento } from "@/lib/geo/departamentos";
import { regionForDepartment } from "@/lib/geo/regions";
import { aparatoDelCatalogo } from "@/lib/aparatos/catalogo";
import { DIAS_MES_DEFECTO, type UsoAparato } from "@/lib/aparatos/calculo";
import { simularAparato, type ResultadoSimulacion } from "@/lib/aparatos/simulador";
import { CONEXIONES, HORARIOS, TIPOS_NEGOCIO, VEREDICTOS, esOpcion } from "@/lib/negocio/opciones";
import type { Veredicto } from "@/lib/savings/types";
import { cargarMiNegocio, tarifaVigente } from "./datos";
import { generarCodigo } from "@/lib/invitaciones/codigo";

function texto(formData: FormData, campo: string, max = 120): string | null {
  const valor = String(formData.get(campo) ?? "").trim().slice(0, max);
  return valor || null;
}

/** Número ≥ 0 escrito con punto o coma; null si está vacío o no es número. */
function aNumero(crudo: unknown): number | null {
  if (typeof crudo === "number") return Number.isFinite(crudo) && crudo >= 0 ? crudo : null;
  const limpio = String(crudo ?? "").trim().replace(/\s|\$/g, "");
  if (!limpio) return null;
  // "180.000" es miles en Colombia; "1,5" es decimal.
  const normal = /^\d{1,3}(\.\d{3})+$/.test(limpio) ? limpio.replace(/\./g, "") : limpio.replace(",", ".");
  const n = Number(normal);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function numero(formData: FormData, campo: string): number | null {
  return aNumero(formData.get(campo));
}

function entre(n: number | null, min: number, max: number): number | null {
  return n === null ? null : Math.min(max, Math.max(min, n));
}

/** Cliente con sesión; user_id lo pone la base de datos y la RLS lo verifica. */
async function clienteConSesion() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/ingresar?siguiente=/mi-negocio");
  return supabase;
}

/** Id del negocio de la cuenta; lo crea vacío si aún no existe. */
async function asegurarNegocio(supabase: SupabaseClient): Promise<string | null> {
  const { data } = await supabase.from("negocios").select("id").maybeSingle();
  if (data) return data.id;
  const { data: nuevo, error } = await supabase.from("negocios").insert({}).select("id").single();
  if (error) {
    console.error("[mi-negocio] no se pudo crear el negocio", error.message);
    return null;
  }
  return nuevo.id;
}

function perfilDesde(datos: { tipo?: unknown; departamento?: unknown; municipio?: unknown; horario?: unknown; conexion?: unknown }) {
  const departamento = typeof datos.departamento === "string" && datosDepartamento(datos.departamento) ? datos.departamento : null;
  return {
    tipo_negocio: esOpcion(TIPOS_NEGOCIO, datos.tipo) ? datos.tipo : null,
    departamento,
    region: departamento ? regionForDepartment(departamento) ?? null : null,
    municipio: typeof datos.municipio === "string" ? datos.municipio.trim().slice(0, 80) || null : null,
    horario: esOpcion(HORARIOS, datos.horario) ? datos.horario : null,
    conexion: esOpcion(CONEXIONES, datos.conexion) ? datos.conexion : null,
  };
}

export async function guardarPerfil(formData: FormData) {
  const supabase = await clienteConSesion();
  const negocioId = await asegurarNegocio(supabase);
  if (!negocioId) return;
  const { error } = await supabase
    .from("negocios")
    .update({
      nombre: texto(formData, "nombre"),
      ...perfilDesde({
        tipo: formData.get("tipo_negocio"),
        departamento: formData.get("departamento"),
        municipio: formData.get("municipio"),
        horario: formData.get("horario"),
        conexion: formData.get("conexion"),
      }),
    })
    .eq("id", negocioId);
  if (error) console.error("[mi-negocio] no se pudo guardar el perfil", error.message);
  revalidatePath("/mi-negocio");
}

/** Cada actualización es una fila nueva en recibos: queda el historial. */
export async function actualizarRecibo(formData: FormData) {
  const supabase = await clienteConSesion();
  const consumo = numero(formData, "consumo_kwh");
  const valor = numero(formData, "valor");
  if (!consumo && !valor) return;
  const mes = /^\d{4}-\d{2}$/.test(String(formData.get("mes") ?? "")) ? `${formData.get("mes")}-01` : undefined;

  const { error } = await supabase.from("recibos").insert({ consumo_kwh: consumo || null, valor: valor || null, mes });
  if (error) console.error("[mi-negocio] no se pudo guardar el recibo", error.message);
  revalidatePath("/mi-negocio");
}

/** Borra todos los recibos de un mes: si quedara uno anterior del mismo mes, volvería a aparecer. */
export async function borrarRecibo(formData: FormData) {
  const supabase = await clienteConSesion();
  const mes = texto(formData, "mes", 10);
  if (!mes || !/^\d{4}-\d{2}-01$/.test(mes)) return;
  const { error } = await supabase.from("recibos").delete().eq("mes", mes);
  if (error) console.error("[mi-negocio] no se pudo borrar el recibo", error.message);
  revalidatePath("/mi-negocio");
}

export async function guardarTarifa(formData: FormData) {
  const supabase = await clienteConSesion();
  const negocioId = await asegurarNegocio(supabase);
  const tarifa = numero(formData, "tarifa_kwh");
  if (!negocioId || !tarifa) return;
  const { error } = await supabase.from("negocios").update({ tarifa_manual_kwh: tarifa }).eq("id", negocioId);
  if (error) console.error("[mi-negocio] no se pudo guardar la tarifa", error.message);
  revalidatePath("/mi-negocio");
}

function aparatoDesde(formData: FormData) {
  const tipo = aparatoDelCatalogo(texto(formData, "tipo_catalogo", 40))?.tipo ?? null;
  // El formulario pide el factor en porcentaje (0 a 100).
  const factorPct = entre(numero(formData, "factor_pct"), 1, 100);
  return {
    tipo_catalogo: tipo,
    nombre: texto(formData, "nombre") ?? aparatoDelCatalogo(tipo)?.nombre ?? "Aparato",
    cantidad: Math.round(entre(numero(formData, "cantidad"), 1, 1000) ?? 1),
    potencia_w: numero(formData, "potencia_w"),
    factor_ciclo: factorPct === null ? 1 : factorPct / 100,
    horas_dia: entre(numero(formData, "horas_dia"), 0, 24),
    dias_mes: entre(numero(formData, "dias_mes"), 1, 31) ?? DIAS_MES_DEFECTO,
    kwh_anio_etiqueta: numero(formData, "kwh_anio_etiqueta") || null,
  };
}

export async function guardarAparato(formData: FormData) {
  const supabase = await clienteConSesion();
  const datos = aparatoDesde(formData);
  const id = texto(formData, "id", 64);

  if (id) {
    const { error } = await supabase.from("aparatos").update(datos).eq("id", id);
    if (error) console.error("[mi-negocio] no se pudo editar el aparato", error.message);
  } else {
    const negocioId = await asegurarNegocio(supabase);
    if (!negocioId) return;
    const { error } = await supabase.from("aparatos").insert({ ...datos, negocio_id: negocioId });
    if (error) {
      console.error("[mi-negocio] no se pudo agregar el aparato", error.message);
    } else {
      const { count } = await supabase.from("aparatos").select("id", { count: "exact", head: true });
      await registrarEventoCuenta(supabase, "aparato_registrado", { total: count ?? null, tipo: datos.tipo_catalogo });
    }
  }
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

export async function registrarRankingVisto(aparatos: number) {
  const supabase = await clienteConSesion();
  await registrarEventoCuenta(supabase, "ranking_visto", { aparatos: Math.round(aNumero(aparatos) ?? 0) });
}

/**
 * Guarda el resultado que trajo a la persona desde la calculadora: perfil,
 * recibo (solo números) y veredicto. Los datos vienen del navegador, así que
 * se validan uno por uno.
 */
export async function guardarResultadoCalculadora(crudo: unknown): Promise<{ ok: boolean }> {
  const supabase = await clienteConSesion();
  if (!crudo || typeof crudo !== "object") return { ok: false };
  const p = crudo as Record<string, unknown>;
  if (!VEREDICTOS.includes(p.veredicto as Veredicto)) return { ok: false };

  const negocioId = await asegurarNegocio(supabase);
  if (!negocioId) return { ok: false };

  const perfil = perfilDesde({ tipo: p.tipoNegocio, departamento: p.departamento, municipio: p.municipio, horario: p.horario, conexion: p.conexion });
  const { error } = await supabase
    .from("negocios")
    .update({
      // Solo pisa los campos que la calculadora sí trajo.
      ...Object.fromEntries(Object.entries(perfil).filter(([, v]) => v !== null)),
      resultado_veredicto: p.veredicto,
      resultado_kwp: aNumero(p.kwp),
      resultado_ahorro_mensual: aNumero(p.ahorroMensual),
      resultado_retorno_meses: aNumero(p.retornoMeses),
      resultado_guardado_en: new Date().toISOString(),
    })
    .eq("id", negocioId);
  if (error) {
    console.error("[mi-negocio] no se pudo guardar el resultado", error.message);
    return { ok: false };
  }

  const consumo = aNumero(p.consumoKwh) || null;
  const valor = aNumero(p.valor) || null;
  if (consumo || valor) {
    const { error: errRecibo } = await supabase.from("recibos").insert({ consumo_kwh: consumo, valor, origen: "calculadora" });
    if (errRecibo) console.error("[mi-negocio] no se pudo guardar el recibo", errRecibo.message);
  }

  await registrarEventoCuenta(supabase, "resultado_guardado", { veredicto: p.veredicto as string });
  revalidatePath("/mi-negocio");
  return { ok: true };
}

export type RespuestaSimulacion = { ok: true; resultado: ResultadoSimulacion } | { ok: false; error: string };

/** "¿Y si agrego…?": no guarda nada. La base sale de la cuenta, no del navegador. */
export async function simular(nuevo: UsoAparato): Promise<RespuestaSimulacion> {
  const supabase = await clienteConSesion();
  const { negocio, recibo } = await cargarMiNegocio(supabase);
  const tarifa = tarifaVigente(negocio, recibo);
  if (!tarifa) return { ok: false, error: "Guarda tu recibo o escribe tu tarifa para simular." };

  const consumo = recibo?.consumo_kwh ?? (recibo?.valor ? recibo.valor / tarifa : null);
  const valor = recibo?.valor ?? (consumo ? consumo * tarifa : null);
  if (!consumo || !valor) return { ok: false, error: "Guarda tu recibo para simular." };

  const perfil = perfilDesde({ tipo: negocio?.tipo_negocio, departamento: negocio?.departamento, municipio: negocio?.municipio, horario: negocio?.horario, conexion: negocio?.conexion });
  if (!perfil.tipo_negocio || !perfil.departamento || !perfil.region || !perfil.horario || !perfil.conexion) {
    return { ok: false, error: "Completa el tipo de negocio, el departamento, el horario y cómo te llega la luz para simular." };
  }

  const aparato: UsoAparato = {
    nombre: String(nuevo?.nombre ?? "Aparato").slice(0, 120),
    tipo: aparatoDelCatalogo(nuevo?.tipo)?.tipo ?? null,
    cantidad: Math.round(entre(aNumero(nuevo?.cantidad), 1, 1000) ?? 1),
    potenciaW: aNumero(nuevo?.potenciaW) ?? 0,
    factorCiclo: entre(aNumero(nuevo?.factorCiclo), 0.01, 1) ?? 1,
    horasDia: entre(aNumero(nuevo?.horasDia), 0, 24) ?? 0,
    diasMes: entre(aNumero(nuevo?.diasMes), 1, 31) ?? DIAS_MES_DEFECTO,
    kwhAnioEtiqueta: aNumero(nuevo?.kwhAnioEtiqueta) || null,
  };

  const resultado = simularAparato(
    {
      perfil: {
        tipoNegocio: perfil.tipo_negocio,
        departamento: perfil.departamento,
        region: perfil.region,
        horario: perfil.horario,
        conexion: perfil.conexion,
        municipio: perfil.municipio ?? undefined,
      },
      consumoKwh: consumo,
      valor,
      tarifaKwh: tarifa,
    },
    aparato
  );
  return { ok: true, resultado };
}

/** "Invitar a mi socio": un enlace por cuenta. Si ya existe, no crea otro. */
export async function crearInvitacion() {
  const supabase = await clienteConSesion();
  const { data: existente } = await supabase.from("invitaciones").select("codigo").not("codigo", "is", null).maybeSingle();
  if (existente) return;

  // Con 50 bits un choque es casi imposible; si pasa, se intenta con otro código.
  for (let intento = 0; intento < 3; intento++) {
    const codigo = generarCodigo();
    const { error } = await supabase.from("invitaciones").insert({ codigo });
    if (!error) {
      await registrarEventoCuenta(supabase, "invitacion_creada", { codigo });
      break;
    }
    if (error.code !== "23505") {
      console.error("[invitaciones] no se pudo crear", error.message);
      break;
    }
    // 23505 también salta si otra pestaña ya creó el enlace de esta cuenta.
    const { data: ya } = await supabase.from("invitaciones").select("codigo").not("codigo", "is", null).maybeSingle();
    if (ya) break;
  }
  revalidatePath("/mi-negocio");
}
