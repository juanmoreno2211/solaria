import type { Region } from "@/lib/config/pricing";

/** Agrupación departamental del modelo Solar IA; no son límites físicos exactos de regiones naturales. */
export const REGION_DEPARTMENTS: Record<Region, string[]> = {
  caribe: ["Atlántico", "Bolívar", "Cesar", "Córdoba", "La Guajira", "Magdalena", "Sucre"],
  andina: ["Antioquia", "Bogotá D.C.", "Boyacá", "Caldas", "Cundinamarca", "Huila", "Norte de Santander", "Quindío", "Risaralda", "Santander", "Tolima"],
  pacifico: ["Cauca", "Chocó", "Nariño", "Valle del Cauca"],
  orinoquia: ["Arauca", "Casanare", "Meta", "Vichada"],
  amazonia: ["Amazonas", "Caquetá", "Guainía", "Guaviare", "Putumayo", "Vaupés"],
  insular: ["San Andrés y Providencia"],
};

export const REGION_LABELS: Record<Region, string> = {
  caribe: "Caribe",
  andina: "Andina",
  pacifico: "Pacífico",
  orinoquia: "Orinoquía",
  amazonia: "Amazonía",
  insular: "Insular",
};

export const REGION_KEYS: Region[] = ["caribe", "andina", "pacifico", "orinoquia", "amazonia", "insular"];

export const DEPARTMENT_REGION: Record<string, Region> = Object.fromEntries(
  REGION_KEYS.flatMap((region) => REGION_DEPARTMENTS[region].map((department) => [department, region]))
) as Record<string, Region>;

/** Solo nombres propios del mapa: "toString" u otras claves heredadas no cuentan. */
export function regionForDepartment(departamento: string): Region | undefined {
  return Object.prototype.hasOwnProperty.call(DEPARTMENT_REGION, departamento)
    ? DEPARTMENT_REGION[departamento]
    : undefined;
}