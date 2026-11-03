import type { ProjectionInput, ProjectionResult } from "./projection";

export interface FinanzasInput {
  inversionTotalCOP?: number;
  costosAdicionalesCOP?: number;
  mantenimientoAnualCOP?: number;
  costoEnergiaActualCOP?: number;
  porcentajeCostoEvitable?: number;
  reposicionBateriaCOP?: number;
  aniosReposicionBateria?: number;
  reposicionInversorCOP?: number;
  aniosReposicionInversor?: number;
  simularDeduccion?: boolean;
  baseElegibleCOP?: number;
  tarifaRentaPct?: number;
  rentaLiquidaAnualCOP?: number;
}
export type CampoFinanciero = Exclude<keyof FinanzasInput, "simularDeduccion">;
export type FinanzasFormState = Partial<Record<CampoFinanciero, string>> & { simularDeduccion?: boolean };
export interface AnalisisFinanciero {
  estado: "estimado" | "incompleto";
  origen: "referencia" | "catalogo" | "cotizacion_usuario";
  motivo?: string;
  inversion: number | null;
  inversionMin: number | null;
  inversionMax: number | null;
  solar: number;
  bateria: number;
  adecuacion: number;
  adicionales: number;
  modulosBateria: number;
  capacidadPresupuestadaKwh: number;
  mantenimientoAnual: number | null;
  ahorroMensualBase: number | null;
  costoEnergiaActualCOP?: number;
  porcentajeCostoEvitable?: number;
  reposicionBateriaCOP: number;
  aniosReposicionBateria: number;
  reposicionInversorCOP: number;
  aniosReposicionInversor: number;
  simulacionTributaria: boolean;
  proyeccion?: ProjectionResult;
  parametrosProyeccion?: ProjectionInput;
  supuestos: string[];
}
