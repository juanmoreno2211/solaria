import type { Region } from "@/lib/config/pricing";

export type TipoPredio = "casa" | "negocio" | "finca";
export type ConexionRed = "interconectado" | "zona_no_interconectada";
export type Estrato = 1 | 2 | 3 | 4 | 5 | 6;
export type TamanoRefrigeracion = "pequena" | "media" | "grande";

export interface ReciboInput {
  fuente: "foto" | "manual";
  consumoMensualKwh: number | null;
  valorPagadoMensual: number | null;
  periodoFacturado?: string | null;
  ciudad?: string | null;
  confianzaExtraccion?: "alta" | "media" | "baja" | null;
}

export interface PredioInput {
  tipoPredio: TipoPredio;
  estrato?: Estrato;
  esComercialOIndustrial?: "comercial" | "industrial";
  region: Region;
  conexionRed: ConexionRed;
  tieneRefrigeracionCritica: boolean;
  tamanoRefrigeracion?: TamanoRefrigeracion;
  interesIluminacionExterior: boolean;
  puntosIluminacionAprox?: number;
}

export interface AnalisisInput {
  recibo: ReciboInput;
  predio: PredioInput;
}

export interface AlternativaResultado {
  id: "paneles" | "iluminacion" | "refrigeracion";
  nombre: string;
  aplica: boolean;
  motivoNoAplica?: string;
  inversionEstimadaMin: number;
  inversionEstimadaMax: number;
  ahorroMensualEstimado: number;
  ahorroPorcentual: number;
  retornoMeses: number | null;
  ahorro5Anios: number;
  ahorro10Anios: number;
  idealPara: string[];
}

export interface AnalisisResultado {
  consumoMensualKwh: number;
  valorPagadoMensual: number;
  tarifaEstimadaKwh: number;
  alternativas: AlternativaResultado[];
  mejorAlternativaId: AlternativaResultado["id"] | null;
  ahorroCombinadoMensual: number;
  ahorroCombinadoPorcentual: number;
}
