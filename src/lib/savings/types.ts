import type { AnalisisFinanciero, FinanzasInput } from "./financial-types";
import type { Region } from "@/lib/config/pricing";
import type { ConexionElectrica, EstadoDatos, OrigenDatos, ProveedorCoincidente, SolucionSolar, TipoOferta, ZonaNegocio } from "@/lib/catalog/types";

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
  /**
   * Departamento del negocio: define las horas de sol pico del cálculo.
   * La API lo exige; es opcional aquí para no romper pruebas sin ubicación.
   */
  departamento?: string;
  cargasCriticas: CargaCritica[];
  horario: Horario;
  fallaLuz?: FallaLuz;
  conexion?: ConexionElectrica;
  zona?: ZonaNegocio;
  municipio?: string;
  /** Potencia media de las cargas a respaldar, no potencia pico del inversor. */
  potenciaCriticaW?: number;
  horasAutonomia?: number;
  legalmenteConstituido?: "si" | "no" | "nose";
  finanzas?: FinanzasInput;
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
  finanzas?: AnalisisFinanciero;
  /** Identifica la tarjeta: el proveedor, o "proveedor:tipo" si tiene varias ofertas. */
  id: string;
  proveedor: string;
  /** Título de la tarjeta, p. ej. "Sunvolt, sin inversión inicial (PPA)". */
  titulo: string;
  tipoOferta?: TipoOferta;
  estadoDatos: EstadoDatos;
  origenDatos?: OrigenDatos;
  /** Etiqueta de la tarjeta, si el catálogo define una propia. */
  etiqueta?: string;
  requiereVisitaTecnica?: boolean;
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
  /** PPA: sin inversión; el cliente paga la energía generada con descuento sobre la red. */
  ppa?: {
    pagoMensual: number;
    descuentoSobreRed: number;
    contrato?: string;
  };
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
  finanzas?: AnalisisFinanciero;
  id: "paneles";
  nombre: string;
  aplica: boolean;
  motivoNoAplica?: string;
  kwpRequeridos: number;
  inversionEstimadaMin: number;
  inversionEstimadaMax: number;
  /** Base exacta del escenario, antes de redondear los kWp para mostrarlos. */
  inversionBase?: number;
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

/** Con qué sol se calculó: el del departamento o, si falta, el de la región. */
export interface UbicacionCalculo {
  region: Region;
  departamento?: string;
  municipio?: string;
  /** HSP que usó el cálculo. */
  hsp: number;
  hspMin: number;
  hspMax: number;
  fuente: "departamento" | "region";
}

export interface AnalisisResultado {
  energia?: OrientacionEnergetica;
  proveedores?: ProveedorCoincidente[];
  proveedoresComunitarios?: ProveedorCoincidente[];
  ubicacion: UbicacionCalculo;
  /** Parte del consumo que cubren los paneles según el horario (sin baterías). */
  cobertura: number;
  consumoMensualKwh: number;
  consumoEstimado?: boolean;
  valorEstimado?: boolean;
  valorPagadoMensual: number;
  tarifaEstimadaKwh: number;
  alternativas: AlternativaResultado[];
  mejorAlternativaId: AlternativaResultado["id"] | null;
  veredicto: Veredicto;
  motivoVeredicto: string;
}

export interface OrientacionEnergetica {
  conexion: ConexionElectrica;
  solucion: SolucionSolar;
  titulo: string;
  motivo: string;
  requiereEstudio: boolean;
  consumoDiarioKwh: number;
  /** Balance con HSP promedio: no garantiza suministro en el peor mes. */
  potenciaSolarBaseKwp: number;
  bateriaNominalKwh?: number;
  energiaRespaldoKwh?: number;
  autonomiaSolicitadaHoras?: number;
  potenciaCriticaW?: number;
  supuestosBateria?: { profundidadDescarga: number; eficiencia: number };
  advertencias: string[];
}
