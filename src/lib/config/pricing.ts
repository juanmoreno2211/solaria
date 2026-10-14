import type { Horario } from "@/lib/savings/types";

/**
 * Valores de referencia para el mercado colombiano (COP).
 * Son estimados basados en promedios públicos de tarifas de energía y precios
 * de mercado de sistemas solares en Colombia (2025). Ajusta estas constantes
 * cuando tengas cotizaciones reales de proveedores o tarifas actualizadas.
 */

export type Region =
  | "caribe"
  | "andina"
  | "pacifico"
  | "orinoquia"
  | "amazonia"
  | "insular";

/** Horas Sol Pico (HSP) promedio por región de Colombia. */
export const HORAS_SOL_PICO: Record<Region, number> = {
  caribe: 6.0,
  insular: 5.6,
  orinoquia: 5.2,
  amazonia: 4.2,
  andina: 4.3,
  pacifico: 3.8,
};

export const REGIONES: { value: Region; label: string }[] = [
  { value: "caribe", label: "Caribe (Atlántico, Magdalena, La Guajira, Cesar, Córdoba, Sucre, Bolívar)" },
  { value: "andina", label: "Andina (Bogotá, Antioquia, Santanderes, Eje Cafetero, Tolima, Huila)" },
  { value: "pacifico", label: "Pacífico (Valle, Cauca, Nariño, Chocó)" },
  { value: "orinoquia", label: "Orinoquía (Meta, Casanare, Arauca, Vichada)" },
  { value: "amazonia", label: "Amazonía (Caquetá, Putumayo, Amazonas, Guaviare)" },
  { value: "insular", label: "Insular (San Andrés y Providencia)" },
];

/**
 * Tarifa comercial estimada COP/kWh, solo cuando el recibo no trae el valor
 * pagado. Supuesto por validar: debería salir del recibo, no de una tabla fija.
 */
export const TARIFA_COMERCIAL_COP_KWH = 920;

/**
 * Costo estimado de instalación solar por kWp instalado (COP), sin baterías.
 * Supuesto por validar: es más alto que los rangos públicos consultados
 * ($2,3 a $4,2 millones por kWp). Calibrar con una cotización real.
 */
export const COSTO_PANELES_POR_KWP = 6_000_000;

/** Factor de desempeño del sistema (pérdidas por inversor, cableado, suciedad, etc). */
export const PERFORMANCE_RATIO = 0.78;

/**
 * Fracción del consumo que pueden cubrir los paneles sin baterías, según el
 * horario del negocio (solo se aprovecha la energía que se usa de día).
 * Supuestos por validar.
 */
export const COBERTURA_POR_HORARIO: Record<Horario, number> = {
  dia: 0.8,
  dia_noche: 0.6,
  "24h": 0.45,
};

/** Mantenimiento anual como fracción de la inversión. */
export const MANTENIMIENTO_ANUAL = 0.015;

/** Umbrales de la recomendación. Supuestos por validar. */
export const UMBRALES_RECOMENDACION = {
  retornoConvieneAnios: 6,
  retornoCompararAnios: 9,
  consumoMinimoKwh: 150,
  ahorroMinimoFraccion: 0.15,
};
