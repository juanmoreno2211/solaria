import type { Veredicto } from "@/lib/savings/types";

/**
 * Resultado de la calculadora que espera a que la persona ingrese a su
 * cuenta. Solo números y códigos: nunca la foto del recibo.
 */
export interface ResultadoPendiente {
  consumoKwh: number | null;
  valor: number | null;
  tipoNegocio: string;
  departamento: string;
  municipio?: string;
  horario: string;
  conexion: string;
  veredicto: Veredicto;
  kwp: number | null;
  ahorroMensual: number | null;
  retornoMeses: number | null;
}

const CLAVE = "solaria_resultado_pendiente";

/** localStorage (no sessionStorage): sobrevive si el enlace de confirmación se abre en otra pestaña. */
export function guardarPendiente(datos: ResultadoPendiente): void {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(datos));
  } catch {
    // Sin almacenamiento, la persona llega a Mi negocio y escribe sus datos.
  }
}

export function tomarPendiente(): unknown {
  try {
    const crudo = localStorage.getItem(CLAVE);
    localStorage.removeItem(CLAVE);
    return crudo ? JSON.parse(crudo) : null;
  } catch {
    return null;
  }
}
