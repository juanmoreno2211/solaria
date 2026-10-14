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

export interface CatalogoPanelSistema extends ProveedorInfo {
  nombreSistema: string;
  kwpMin: number;
  kwpMax: number;
  precioPorKwpCOP: number;
  regiones: RegionesCobertura;
  /** true mientras el proveedor sea de ejemplo y no una empresa real. */
  esSimulado?: boolean;
  instalacion?: string;
  pagoDescripcion?: string;
  financiacion?: FinanciacionProveedor | null;
}

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
