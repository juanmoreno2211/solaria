import type { AnalisisResultado } from "@/lib/savings/types";

/**
 * Texto de la recomendación. Sale solo de la plantilla (el motivo del
 * veredicto, con las cifras ya calculadas): ningún modelo redacta cifras.
 */
export function generarRecomendacion(resultado: AnalisisResultado): string {
  return resultado.motivoVeredicto;
}
