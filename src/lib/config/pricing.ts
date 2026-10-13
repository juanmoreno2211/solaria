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
  { value: "andina", label: "Andina (Bogotá, Cundinamarca, Antioquia, Santanderes, Eje Cafetero, Tolima, Huila)" },
  { value: "pacifico", label: "Pacífico (Valle, Cauca, Nariño, Chocó)" },
  { value: "orinoquia", label: "Orinoquía (Meta, Casanare, Arauca, Vichada)" },
  { value: "amazonia", label: "Amazonía (Caquetá, Putumayo, Amazonas, Guaviare)" },
  { value: "insular", label: "Insular (San Andrés y Providencia)" },
];

/**
 * Departamentos que se preguntan en el paso 2, por región. Por ahora solo en
 * el Caribe. Sirven para ocultar la nota de cobertura de los proveedores con
 * `departamentosConfirmados` y viajan con la solicitud de cotización.
 */
export const DEPARTAMENTOS: Partial<Record<Region, string[]>> = {
  caribe: ["Atlántico", "Bolívar", "Cesar", "Córdoba", "La Guajira", "Magdalena", "Sucre"],
};

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

/**
 * Un plan fijo aplica si cubre al menos esta fracción del sistema necesario
 * (plan un poco más chico que lo necesario). Supuesto por validar.
 */
export const PLAN_COBERTURA_MINIMA = 0.8;

/**
 * Un plan fijo aplica si el negocio aprovecha al menos esta fracción de su
 * potencia (si no, pagaría un plan demasiado grande). Supuesto por validar.
 */
export const PLAN_USO_MINIMO = 0.5;

/** Umbrales de la recomendación. Supuestos por validar. */
export const UMBRALES_RECOMENDACION = {
  retornoConvieneAnios: 6,
  retornoCompararAnios: 9,
  consumoMinimoKwh: 150,
  ahorroMinimoFraccion: 0.15,
};

/**
 * Estimación del equipo para Sunvolt (no son datos de Sunvolt; todo por
 * confirmar). Deben coincidir con su entrada en catalogo.json.
 *
 * | Parámetro                   | Valor            | De dónde sale                                                 |
 * |-----------------------------|------------------|---------------------------------------------------------------|
 * | Precio del EPC              | $6.000.000/kWp   | Entre la guía pública (≈ $2,3 a $4,2 M/kWp) y la referencia   |
 * |                             |                  | de Erco (≈ $8 M/kWp). Antes era $4.000.000                    |
 * | Tamaño mínimo del EPC       | 2 kWp            | Supuesto                                                      |
 * | Financiación del EPC        | ninguna          | No hay dato ("a confirmar")                                   |
 * | Descuento del PPA           | 15 %             | Supuesto: Sunvolt solo dice "a menor costo que la red"        |
 * | Tamaño mínimo del PPA       | 3 kWp            | Supuesto: los PPA suelen pedir un consumo mínimo              |
 * | Contrato PPA e instalación  | "a confirmar"    | No hay dato                                                   |
 *
 * Fuente: sunvolt.com.co, revisado el 2026-10-13.
 */
export const SUNVOLT_ESTIMACION = {
  precioEpcPorKwp: 6_000_000,
  kwpMinEpc: 2,
  descuentoPpaSobreRed: 0.15,
  kwpMinPpa: 3,
};
