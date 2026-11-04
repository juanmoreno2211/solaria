import { aparatoDelCatalogo } from "./catalogo";

/**
 * Riesgo de que un aparato se dañe cuando se va y vuelve la luz. Sale del
 * tipo de aparato en el catálogo, no lo escribe el usuario, y no cambia kWh,
 * costo ni veredicto. Los que tienen compresor sufren más con el pico de
 * voltaje al volver la luz. Estimación del equipo, por verificar.
 */
export type RiesgoCorte = "alto" | "medio" | "bajo";

export function riesgoDe(tipo: string | null | undefined): RiesgoCorte | null {
  return aparatoDelCatalogo(tipo)?.riesgoCorte ?? null;
}

/** "Si se va y vuelve la luz: 2 con riesgo alto de dañarse y 1 con riesgo medio." Null si no hay ninguno alto o medio. */
export function resumenRiesgo(tipos: (string | null | undefined)[]): string | null {
  const riesgos = tipos.map(riesgoDe);
  const alto = riesgos.filter((r) => r === "alto").length;
  const medio = riesgos.filter((r) => r === "medio").length;
  const partes = [alto > 0 && `${alto} con riesgo alto de dañarse`, medio > 0 && `${medio} con riesgo medio`].filter(Boolean);
  return partes.length ? `Si se va y vuelve la luz: ${partes.join(" y ")}.` : null;
}
