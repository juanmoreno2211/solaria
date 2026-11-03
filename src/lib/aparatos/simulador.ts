import type { Region } from "@/lib/config/pricing";
import type { ConexionElectrica } from "@/lib/catalog/types";
import { calcularAhorro } from "@/lib/savings/calculate";
import type { Horario, TipoNegocio, Veredicto } from "@/lib/savings/types";
import { costoMes, kwhMes, type UsoAparato } from "./calculo";

export interface PerfilSimulacion {
  tipoNegocio: TipoNegocio;
  region: Region;
  departamento: string;
  horario: Horario;
  conexion: ConexionElectrica;
  municipio?: string;
}

export interface BaseSimulacion {
  perfil: PerfilSimulacion;
  consumoKwh: number;
  valor: number;
  tarifaKwh: number;
}

export type FuncionVeredicto = (perfil: PerfilSimulacion, consumoKwh: number, valor: number) => Veredicto;

/** El mismo veredicto de la calculadora, con los datos guardados del negocio. */
export const veredictoCalculadora: FuncionVeredicto = (perfil, consumoKwh, valor) =>
  calcularAhorro({
    recibo: { fuente: "manual", consumoMensualKwh: consumoKwh, valorPagadoMensual: valor },
    negocio: { ...perfil, cargasCriticas: [] },
  }).veredicto;

export interface ResultadoSimulacion {
  kwhExtra: number;
  costoExtra: number;
  /** Cuánto subiría el recibo, en porcentaje del valor actual. */
  porcentajeExtra: number;
  veredictoAntes: Veredicto;
  veredictoDespues: Veredicto;
  cambia: boolean;
  /** Antes no convenía y con el aparato nuevo sí (o hay que comparar): vuelve el botón de cotización. */
  muestraCotizacion: boolean;
}

const CON_COTIZACION: Veredicto[] = ["conviene", "comparar"];

/** Simula agregar un aparato sin guardarlo. */
export function simularAparato(
  base: BaseSimulacion,
  nuevo: UsoAparato,
  veredicto: FuncionVeredicto = veredictoCalculadora
): ResultadoSimulacion {
  const kwhExtra = kwhMes(nuevo);
  const costoExtra = costoMes(nuevo, base.tarifaKwh);
  const veredictoAntes = veredicto(base.perfil, base.consumoKwh, base.valor);
  const veredictoDespues = veredicto(base.perfil, base.consumoKwh + kwhExtra, base.valor + costoExtra);
  return {
    kwhExtra,
    costoExtra,
    porcentajeExtra: base.valor > 0 ? (costoExtra / base.valor) * 100 : 0,
    veredictoAntes,
    veredictoDespues,
    cambia: veredictoAntes !== veredictoDespues,
    muestraCotizacion: CON_COTIZACION.includes(veredictoDespues) && !CON_COTIZACION.includes(veredictoAntes),
  };
}
