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

/** De dónde salen los números: el propio proveedor, una estimación del equipo o la prensa. */
export type OrigenDatos = "proveedor" | "estimacion_equipo" | "prensa";

export interface PlanProveedor {
  nombre: string;
  kwp: number;
  precio: number;
  /** Rango publicado; si no está, se usa ±10 % del precio. */
  precioMin?: number;
  precioMax?: number;
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
  origenDatos?: OrigenDatos;
  /** De dónde salen los datos (origen y fecha). */
  fuente?: string;
  /** Etiqueta de la tarjeta; si no está, la que corresponde a estadoDatos. */
  etiqueta?: string;
  /** Nota de cobertura fija; si no está, se arma con departamentosConfirmados. */
  notaCobertura?: string;
  /** Motivo cuando ningún plan se ajusta al sistema necesario. */
  motivoFueraDeRango?: string;
  requiereVisitaTecnica?: boolean;
  instalacion?: string | null;
  pagoDescripcion?: string;
  financiacion?: FinanciacionProveedor | null;
  simulacionPago?: SimulacionPagoConfig;
}

/** Precio por kWp dentro de un rango de tamaños. */
interface PrecioPorKwp {
  kwpMin: number;
  kwpMax: number;
  precioPorKwpCOP: number;
  /** Margen del rango de inversión (0.15 = ±15 %); por defecto ±10 %. */
  margenPrecio?: number;
  planes?: undefined;
  ofertas?: undefined;
  ppa?: undefined;
}

/** Precio por planes de tamaño fijo. */
interface PrecioPorPlanes {
  planes: PlanProveedor[];
  kwpMin?: undefined;
  kwpMax?: undefined;
  precioPorKwpCOP?: undefined;
  margenPrecio?: undefined;
  ofertas?: undefined;
  ppa?: undefined;
}

/** Sistema llave en mano que el cliente compra. */
export interface OfertaEPC {
  tipo: "EPC";
  nombre: string;
  kwpMin: number;
  kwpMax: number;
  precioPorKwpCOP: number;
  margenPrecio?: number;
  instalacion?: string | null;
  financiacion?: FinanciacionProveedor | null;
  pagoDescripcion?: string;
}

/** El proveedor financia e instala; el cliente paga por la energía generada. */
export interface OfertaPPA {
  tipo: "PPA";
  nombre: string;
  kwpMin: number;
  kwpMax: number;
  /** 0.15 = el cliente paga la energía un 15 % más barata que la red. */
  descuentoSobreRed: number;
  contrato?: string | null;
}

export type OfertaCatalogo = OfertaEPC | OfertaPPA;
export type TipoOferta = OfertaCatalogo["tipo"];

/** Un proveedor con varias ofertas (cada una se muestra en su propia tarjeta). */
interface PrecioPorOfertas {
  ofertas: OfertaCatalogo[];
  planes?: undefined;
  kwpMin?: undefined;
  kwpMax?: undefined;
  precioPorKwpCOP?: undefined;
  ppa?: undefined;
}

export type CatalogoPanelSistema = SistemaBase &
  (PrecioPorKwp | PrecioPorPlanes | PrecioPorOfertas);

/** PPA ya separado de su proveedor. */
interface PrecioPPA {
  kwpMin: number;
  kwpMax: number;
  ppa: { descuentoSobreRed: number; contrato?: string | null };
  planes?: undefined;
  precioPorKwpCOP?: undefined;
  margenPrecio?: undefined;
}

/**
 * Lo que se evalúa y se muestra en una tarjeta: un proveedor, o una de sus
 * ofertas si tiene varias.
 */
export type SistemaVendible = SistemaBase & {
  /** Único entre tarjetas: el proveedor, o "proveedor:tipo" si tiene varias ofertas. */
  id: string;
  tipoOferta?: TipoOferta;
  nombreOferta?: string;
} & (Omit<PrecioPorKwp, "ofertas"> | Omit<PrecioPorPlanes, "ofertas"> | PrecioPPA);

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
