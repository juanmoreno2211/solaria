import type { Region } from "@/lib/config/pricing";
import type { ProveedorRecomendado } from "@/lib/catalog/types";

export type TipoNegocio =
  | "tienda"
  | "restaurante"
  | "consultorio"
  | "taller"
  | "finca"
  | "otro";
export type CargaCritica =
  | "refrigeracion"
  | "equipos"
  | "iluminacion"
  | "caja_datafono"
  | "maquinaria"
  | "bombeo";
export type Horario = "dia" | "dia_noche" | "24h";
export type FallaLuz = "cortes" | "bajones" | "ambos";

export interface ReciboInput {
  fuente: "foto" | "manual";
  consumoMensualKwh: number | null;
  valorPagadoMensual: number | null;
  periodoFacturado?: string | null;
  ciudad?: string | null;
  confianzaExtraccion?: "alta" | "media" | "baja" | null;
}

export interface NegocioInput {
  tipoNegocio: TipoNegocio;
  region: Region;
  cargasCriticas: CargaCritica[];
  horario: Horario;
  fallaLuz: FallaLuz;
  legalmenteConstituido?: boolean;
}

export interface AnalisisInput {
  recibo: ReciboInput;
  negocio: NegocioInput;
}

export type Veredicto = "conviene" | "comparar" | "por_ahora_no";

export interface AlternativaResultado {
  id: "paneles";
  nombre: string;
  aplica: boolean;
  motivoNoAplica?: string;
  kwpRequeridos: number;
  inversionEstimadaMin: number;
  inversionEstimadaMax: number;
  ahorroMensualEstimado: number;
  ahorroPorcentual: number;
  retornoMeses: number | null;
  ahorro5Anios: number;
  ahorro10Anios: number;
  idealPara: string[];
  proveedorRecomendado?: ProveedorRecomendado;
  fuentePrecio: "catalogo" | "estimado";
}

export interface AnalisisResultado {
  consumoMensualKwh: number;
  valorPagadoMensual: number;
  tarifaEstimadaKwh: number;
  alternativas: AlternativaResultado[];
  mejorAlternativaId: AlternativaResultado["id"] | null;
  veredicto: Veredicto;
  motivoVeredicto: string;
}
