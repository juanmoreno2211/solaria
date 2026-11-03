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
  const [{ data: negocio }, { data: recibo }] = await Promise.all([
    supabase.from("negocios").select("*").maybeSingle<NegocioFila>(),
    supabase.from("recibos").select("*").order("creado_en", { ascending: false }).limit(1).maybeSingle<ReciboFila>(),
  ]);
  const { data: aparatos } = negocio
    ? await supabase.from("aparatos").select("*").eq("negocio_id", negocio.id).order("creado_en").returns<AparatoFila[]>()
    : { data: [] as AparatoFila[] };
  return { negocio, recibo, aparatos: aparatos ?? [] };
}

/** Tarifa del último recibo o, si falta, la que escribió el usuario. */
export function tarifaVigente(negocio: NegocioFila | null, recibo: ReciboFila | null): number | null {
  return recibo?.tarifa_kwh ?? negocio?.tarifa_manual_kwh ?? null;
}
