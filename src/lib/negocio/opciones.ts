import type { ConexionElectrica } from "@/lib/catalog/types";
import type { Horario, TipoNegocio, Veredicto } from "@/lib/savings/types";

/** Mismos códigos y textos que la calculadora (StepProperty), para recalcular su veredicto. */
export const TIPOS_NEGOCIO: { v: TipoNegocio; label: string }[] = [
  { v: "tienda", label: "Tienda o supermercado" },
  { v: "restaurante", label: "Restaurante o cafetería" },
  { v: "consultorio", label: "Consultorio o clínica" },
  { v: "taller", label: "Taller o ferretería" },
  { v: "finca", label: "Finca o agro" },
  { v: "otro", label: "Otro tipo de negocio" },
];

export const HORARIOS: { v: Horario; label: string }[] = [
  { v: "dia", label: "De día" },
  { v: "dia_noche", label: "De día y de noche" },
  { v: "24h", label: "Las 24 horas" },
];

export const CONEXIONES: { v: ConexionElectrica; label: string }[] = [
  { v: "estable", label: "Red estable" },
  { v: "intermitente", label: "Red con cortes" },
  { v: "sin_red", label: "Sin conexión a la red" },
  { v: "no_se", label: "No sé" },
];

export const VEREDICTOS: Veredicto[] = ["conviene", "comparar", "por_ahora_no", "sin_proveedores"];

export const TEXTO_VEREDICTO: Record<Veredicto, string> = {
  conviene: "Te conviene pedir cotización",
  comparar: "Puede convenirte: compara con calma",
  por_ahora_no: "Todavía no lo necesitas, pero te ayudamos a ver dónde ahorrar",
  sin_proveedores: "Aún no hay un proveedor para tu caso",
};

export function etiqueta<T extends string>(opciones: { v: T; label: string }[], valor: string | null | undefined): string | undefined {
  return opciones.find((o) => o.v === valor)?.label;
}

export function esOpcion<T extends string>(opciones: { v: T }[], valor: unknown): valor is T {
  return typeof valor === "string" && opciones.some((o) => o.v === valor);
}
