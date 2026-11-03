import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface NegocioFila {
  id: string;
  nombre: string | null;
  tipo_negocio: string | null;
  departamento: string | null;
  municipio: string | null;
  region: string | null;
  horario: string | null;
  conexion: string | null;
  tarifa_manual_kwh: number | null;
  resultado_veredicto: string | null;
  resultado_kwp: number | null;
  resultado_ahorro_mensual: number | null;
  resultado_retorno_meses: number | null;
  resultado_guardado_en: string | null;
}

export interface ReciboFila {
  id: string;
  consumo_kwh: number | null;
  valor: number | null;
  tarifa_kwh: number | null;
  mes: string;
  origen: string;
  creado_en: string;
}

export interface AparatoFila {
  id: string;
  negocio_id: string;
  tipo_catalogo: string | null;
  nombre: string;
  cantidad: number;
  potencia_w: number | null;
  factor_ciclo: number;
  horas_dia: number | null;
  dias_mes: number;
  kwh_anio_etiqueta: number | null;
}

/** Lo que ve Mi negocio. La RLS limita todo a las filas de la sesión. */
export async function cargarMiNegocio(supabase: SupabaseClient) {
  const [{ data: negocio }, { data: recibos }] = await Promise.all([
    supabase.from("negocios").select("*").maybeSingle<NegocioFila>(),
    // Tres años de historial alcanzan para las estadísticas.
    supabase
      .from("recibos")
      .select("*")
      .order("mes", { ascending: false })
      .order("creado_en", { ascending: false })
      .limit(36)
      .returns<ReciboFila[]>(),
  ]);
  const { data: aparatos } = negocio
    ? await supabase.from("aparatos").select("*").eq("negocio_id", negocio.id).order("creado_en").returns<AparatoFila[]>()
    : { data: [] as AparatoFila[] };
  // El recibo vigente es el del mes más reciente, no el último que se escribió.
  return { negocio, recibo: recibos?.[0] ?? null, recibos: recibos ?? [], aparatos: aparatos ?? [] };
}

/** Tarifa del último recibo o, si falta, la que escribió el usuario. */
export function tarifaVigente(negocio: NegocioFila | null, recibo: ReciboFila | null): number | null {
  return recibo?.tarifa_kwh ?? negocio?.tarifa_manual_kwh ?? null;
}

export interface MiInvitacion {
  codigo: string | null;
  aperturas: number;
  cuentas: number;
}

/** El enlace de la cuenta y sus contadores (ceros si no hay datos). */
export async function cargarMiInvitacion(supabase: SupabaseClient): Promise<MiInvitacion> {
  const [{ data: invitacion }, { data: resumen, error }] = await Promise.all([
    supabase.from("invitaciones").select("codigo").not("codigo", "is", null).maybeSingle<{ codigo: string }>(),
    supabase.rpc("resumen_mis_invitaciones"),
  ]);
  if (error) console.error("[invitaciones] no se pudo leer el resumen", error.message);
  const fila = Array.isArray(resumen) ? resumen[0] : resumen;
  return {
    codigo: invitacion?.codigo ?? null,
    aperturas: Number(fila?.aperturas ?? 0),
    cuentas: Number(fila?.cuentas ?? 0),
  };
}
