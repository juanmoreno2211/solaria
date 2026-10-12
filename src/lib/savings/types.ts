import type { Region } from "@/lib/config/pricing";
import type { EstadoDatos } from "@/lib/catalog/types";

export type TipoNegocio =
  | "tienda"
  | "restaurante"
  | "consultorio"
  | "taller"
  | "finca"
  | "otro";
export type CargaCritica =
  | "neveras"
  | "aire"
  | "medicos"
  | "maquinaria"
  | "computo"
  | "luces";
export type Horario = "dia" | "dia_noche" | "24h";
export type FallaLuz = "cortes" | "bajones" | "ambos";

export interface ReciboInput {
  fuente: "foto" | "manual";
  consumoMensualKwh: number | null;
  valorPagadoMensual: number | null;
}

export interface NegocioInput {
  tipoNegocio: TipoNegocio;
  region: Region;
  /** Solo se pregunta en las regiones de DEPARTAMENTOS (pricing.ts). */
  departamento?: string;
  cargasCriticas: CargaCritica[];
  horario: Horario;
  fallaLuz?: FallaLuz;
  legalmenteConstituido?: "si" | "no" | "nose";
}

export interface AnalisisInput {
  recibo: ReciboInput;
  negocio: NegocioInput;
}

export type Veredicto =
  | "conviene"
  | "comparar"
  | "por_ahora_no"
  | "sin_proveedores";

export interface PagoSimulado {
  cuotaInicialPct: number;
  cuotaInicial: number;
  monto: number;
  cuotaMensual: number;
  plazoMeses: number;
  /** Ahorro − cuota − mantenimiento mensual. */
  flujoMensual: number;
}

export interface OfertaProveedor {
  proveedor: string;
  estadoDatos: EstadoDatos;
  /** Atiende la zona del negocio, aunque no aplique por tamaño. */
  cubreZona: boolean;
  aplica: boolean;
  motivoNoAplica?: string;
  /** Cobertura por confirmar fuera de los departamentos confirmados del proveedor. */
  notaCobertura?: string;
  inversion: number;
  inversionMin: number;
  inversionMax: number;
  /** Ahorro con este sistema: menor que el estimado si el plan cubre menos de lo necesario. */
  ahorroMensual: number;
  mantenimientoMensual: number;
  /** Meses para recuperar la inversión; null si el ahorro no alcanza a pagarla. */
  retornoMeses: number | null;
  /** Plan elegido, si el proveedor vende por planes fijos. */
  plan?: { nombre: string; kwp: number };
  instalacion?: string;
  pagoDescripcion?: string;
  /** Financiación que ofrece el proveedor. */
  financiacion?: PagoSimulado;
  /** Simulación del equipo (no es una oferta del proveedor): una opción por cuota inicial. */
  simulacionPago?: { tasaMensual: number; plazoMeses: number; opciones: PagoSimulado[] };
  /** Proveedores de ejemplo sin financiación: 50 % de la inversión. */
  primerPago?: number;
  /** Segunda opción con un plan que cubre todo el sistema necesario. */
  cubreMas?: OfertaProveedor;
}

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
  fuentePrecio: "catalogo" | "estimado";
  ofertas: OfertaProveedor[];
  mejorOferta?: OfertaProveedor;
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
