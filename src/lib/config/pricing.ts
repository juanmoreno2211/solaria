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

/** Tarifa estimada COP/kWh cuando no se conoce el valor exacto pagado. */
export const TARIFA_ESTIMADA_COP_KWH = {
  estrato1: 480,
  estrato2: 560,
  estrato3: 720,
  estrato4: 880,
  estrato5: 980,
  estrato6: 1020,
  comercial: 920,
  industrial: 780,
  rural_zni: 1350, // zona no interconectada, referencia diesel/planta
};

/** Costo estimado de instalación solar fotovoltaica por kWp instalado (COP). */
export const COSTO_PANELES_POR_KWP = {
  interconectado: 6_000_000,
  zona_no_interconectada: 8_500_000, // incluye baterías, mayor costo
};

/** Factor de desempeño del sistema (pérdidas por inversor, cableado, suciedad, etc). */
export const PERFORMANCE_RATIO = 0.78;

/** Iluminación solar (linternas, reflectores y decorativos solares). */
export const ILUMINACION_SOLAR = {
  costoPromedioPorPunto: 95_000, // COP por lámpara/linterna/reflector solar
  puntosSugeridos: {
    casa: 4,
    negocio: 8,
    finca: 14,
  },
  fraccionConsumoIluminacionExterior: {
    casa: 0.03,
    negocio: 0.07,
    finca: 0.05,
  },
};

/** Refrigeración solar para proteger cadena de frío. */
export const REFRIGERACION_SOLAR = {
  costoBase: 4_500_000,
  costoPorLitroCapacidad: 9_500,
  fraccionConsumoPorTamano: {
    pequena: 0.15, // < 200 L
    media: 0.25, // 200 - 600 L
    grande: 0.35, // > 600 L
  },
};

/** Límite de cobertura: nunca se estima que el sistema cubra más del 95% del consumo. */
export const COBERTURA_MAXIMA = 0.95;
