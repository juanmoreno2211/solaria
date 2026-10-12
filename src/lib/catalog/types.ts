import type { Region } from "@/lib/config/pricing";

export type RegionesCobertura = Region[] | "nacional";

export interface ProveedorInfo {
  proveedor: string;
  marca?: string;
  url?: string;
  telefono?: string;
  notas?: string;
}

export interface FinanciacionProveedor {
  cuotaInicialPct: number; // 0.30 = 30 %
  tasaMensual: number; // 0.017 = 1,7 % mensual
  plazoMeses: number;
}

/**
 * simulado: proveedor de ejemplo, no es una empresa.
 * referencial: empresa real con precios reunidos por el equipo, sin confirmar.
 * confirmado: datos confirmados por el proveedor.
 */
export type EstadoDatos = "simulado" | "referencial" | "confirmado";

export interface PlanProveedor {
  nombre: string;
  kwp: number;
  precio: number;
}

/**
 * Simulación de pago hecha por el equipo (no es una oferta del proveedor):
 * cuota mensual según la cuota inicial que elija el usuario.
 */
export interface SimulacionPagoConfig {
  tasaMensual: number;
  plazoMeses: number;
  opcionesCuotaInicialPct: number[];
  fuente: string;
}

interface SistemaBase extends ProveedorInfo {
  nombreSistema?: string;
  regiones: RegionesCobertura;
  /**
   * Departamentos donde la cobertura está confirmada. En el resto de sus
   * regiones se muestra, con una nota de cobertura por confirmar.
   */
  departamentosConfirmados?: string[];
  estadoDatos: EstadoDatos;
  /** De dónde salen los datos (origen y fecha). */
  fuente?: string;
  instalacion?: string;
  pagoDescripcion?: string;
  financiacion?: FinanciacionProveedor | null;
  simulacionPago?: SimulacionPagoConfig;
}

/** Precio por kWp dentro de un rango de tamaños. */
interface PrecioPorKwp {
  kwpMin: number;
  kwpMax: number;
  precioPorKwpCOP: number;
  planes?: undefined;
}

/** Precio por planes de tamaño fijo. */
interface PrecioPorPlanes {
  planes: PlanProveedor[];
  kwpMin?: undefined;
  kwpMax?: undefined;
  precioPorKwpCOP?: undefined;
}

export type CatalogoPanelSistema = SistemaBase & (PrecioPorKwp | PrecioPorPlanes);

export interface CatalogoIluminacionProducto extends ProveedorInfo {
  nombre: string;
  precioPorUnidadCOP: number;
  lumenes?: number;
  regiones: RegionesCobertura;
}

export interface CatalogoRefrigeracionSistema extends ProveedorInfo {
  nombre: string;
  capacidadLitrosMin: number;
  capacidadLitrosMax: number;
  precioCOP: number;
  autonomiaHoras?: number;
  regiones: RegionesCobertura;
}

export interface CatalogoData {
  paneles: CatalogoPanelSistema[];
  iluminacion: CatalogoIluminacionProducto[];
  refrigeracion: CatalogoRefrigeracionSistema[];
}

export interface ProveedorRecomendado {
  proveedor: string;
  producto: string;
  marca?: string;
  url?: string;
  telefono?: string;
}
