/**
 * Horas sol pico (HSP) por departamento: promedio anual aproximado.
 *
 * En Colombia, 1 HSP = 1 kWh/m²/día de irradiación global horizontal: 5 HSP
 * equivale a 5 horas de sol a 1.000 W/m². Son valores preliminares para
 * estimar; el diseño final debe usar la coordenada exacta (Atlas IDEAM/UPME,
 * Global Solar Atlas, NASA POWER o PVGIS).
 *
 * Bogotá D.C. no aparece en la tabla base: usa el rango de Cundinamarca.
 */
export interface DatosDepartamento {
  hspMin: number;
  hspMax: number;
  /** Ejemplo para el campo de municipio de la cotización (la capital, o una localidad en Bogotá). */
  ejemplo: string;
}

export const DATOS_DEPARTAMENTO: Record<string, DatosDepartamento> = {
  "La Guajira": { hspMin: 5.5, hspMax: 6.0, ejemplo: "Riohacha" },
  Cesar: { hspMin: 5.2, hspMax: 5.6, ejemplo: "Valledupar" },
  Magdalena: { hspMin: 5.2, hspMax: 5.6, ejemplo: "Santa Marta" },
  "Atlántico": { hspMin: 5.0, hspMax: 5.5, ejemplo: "Barranquilla" },
  "Bolívar": { hspMin: 5.0, hspMax: 5.4, ejemplo: "Cartagena" },
  "San Andrés y Providencia": { hspMin: 5.0, hspMax: 5.0, ejemplo: "San Andrés" },
  Sucre: { hspMin: 4.8, hspMax: 5.2, ejemplo: "Sincelejo" },
  "Córdoba": { hspMin: 4.7, hspMax: 5.2, ejemplo: "Montería" },
  "Norte de Santander": { hspMin: 4.0, hspMax: 5.2, ejemplo: "Cúcuta" },
  Santander: { hspMin: 4.5, hspMax: 5.0, ejemplo: "Bucaramanga" },
  Arauca: { hspMin: 4.5, hspMax: 5.2, ejemplo: "Arauca" },
  Casanare: { hspMin: 4.5, hspMax: 5.2, ejemplo: "Yopal" },
  Vichada: { hspMin: 4.5, hspMax: 5.2, ejemplo: "Puerto Carreño" },
  Meta: { hspMin: 4.3, hspMax: 4.7, ejemplo: "Villavicencio" },
  Huila: { hspMin: 4.8, hspMax: 5.2, ejemplo: "Neiva" },
  Tolima: { hspMin: 4.4, hspMax: 4.8, ejemplo: "Ibagué" },
  Cundinamarca: { hspMin: 3.8, hspMax: 4.2, ejemplo: "Soacha" },
  "Bogotá D.C.": { hspMin: 3.8, hspMax: 4.2, ejemplo: "Chapinero" },
  "Boyacá": { hspMin: 4.0, hspMax: 4.6, ejemplo: "Tunja" },
  Antioquia: { hspMin: 4.3, hspMax: 4.7, ejemplo: "Medellín" },
  Caldas: { hspMin: 4.0, hspMax: 4.5, ejemplo: "Manizales" },
  Risaralda: { hspMin: 4.0, hspMax: 4.5, ejemplo: "Pereira" },
  "Quindío": { hspMin: 4.0, hspMax: 4.5, ejemplo: "Armenia" },
  "Valle del Cauca": { hspMin: 4.5, hspMax: 5.0, ejemplo: "Cali" },
  Cauca: { hspMin: 3.8, hspMax: 4.5, ejemplo: "Popayán" },
  "Nariño": { hspMin: 3.8, hspMax: 4.3, ejemplo: "Pasto" },
  Putumayo: { hspMin: 4.0, hspMax: 4.0, ejemplo: "Mocoa" },
  "Caquetá": { hspMin: 4.0, hspMax: 4.5, ejemplo: "Florencia" },
  Guaviare: { hspMin: 4.3, hspMax: 4.3, ejemplo: "San José del Guaviare" },
  "Guainía": { hspMin: 4.5, hspMax: 4.5, ejemplo: "Inírida" },
  "Vaupés": { hspMin: 4.2, hspMax: 4.6, ejemplo: "Mitú" },
  Amazonas: { hspMin: 4.0, hspMax: 4.4, ejemplo: "Leticia" },
  "Chocó": { hspMin: 3.3, hspMax: 4.0, ejemplo: "Quibdó" },
};

/** Escala nacional para el mapa y la barra de rango. */
export const HSP_ESCALA = { min: 3.3, max: 6.0 };

export function datosDepartamento(departamento?: string): DatosDepartamento | undefined {
  return departamento && Object.prototype.hasOwnProperty.call(DATOS_DEPARTAMENTO, departamento)
    ? DATOS_DEPARTAMENTO[departamento]
    : undefined;
}

/**
 * HSP que usa el cálculo: el punto medio del rango del departamento.
 * Para un cálculo más conservador (sistema más grande, retorno más largo),
 * cambia esta línea por `return d.hspMin`.
 */
export function hspParaCalculo(departamento?: string): number | undefined {
  const d = datosDepartamento(departamento);
  if (!d) return undefined;
  return Math.round(((d.hspMin + d.hspMax) / 2) * 100) / 100;
}

/** Cómo leer el recurso solar del departamento, para la interfaz. */
export function calificarHsp(hsp: number): { etiqueta: string; tono: "alto" | "medio" | "bajo" } {
  if (hsp >= 5.2) return { etiqueta: "Sol excelente", tono: "alto" };
  if (hsp >= 4.5) return { etiqueta: "Muy buen sol", tono: "alto" };
  if (hsp >= 4.0) return { etiqueta: "Buen sol", tono: "medio" };
  return { etiqueta: "Sol moderado", tono: "bajo" };
}
