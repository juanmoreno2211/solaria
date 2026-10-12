/**
 * Contrato de la lectura de recibos, independiente del proveedor de IA.
 * Lo usan la ruta /api/leer-recibo y el formulario; no importa ningún SDK.
 */

export const TIPOS_IMAGEN_RECIBO = ["image/jpeg", "image/png", "image/webp"] as const;
export type TipoImagenRecibo = (typeof TIPOS_IMAGEN_RECIBO)[number];

export const TAMANO_MAXIMO_RECIBO = 4 * 1024 * 1024; // 4 MB

export interface DatosRecibo {
  consumoMensualKwh: number | null;
  valorPagadoMensual: number | null;
  periodoFacturado: string | null;
  ciudad: string | null;
  confianza: "alta" | "media" | "baja";
}

export type LecturaRecibo =
  | { disponible: true; datos: DatosRecibo }
  | { disponible: false; mensaje: string };

/** Revisa tipo y tamaño antes de enviar la imagen. Devuelve el error o null. */
export function validarImagenRecibo(tipo: string, tamano: number): string | null {
  if (!(TIPOS_IMAGEN_RECIBO as readonly string[]).includes(tipo)) {
    return "La foto debe ser JPG, PNG o WEBP.";
  }
  if (tamano > TAMANO_MAXIMO_RECIBO) {
    return "La foto pesa más de 4 MB. Toma una con menos resolución o recórtala.";
  }
  if (tamano === 0) return "La foto está vacía.";
  return null;
}

function numeroPlausible(valor: unknown, min: number, max: number): number | null {
  if (typeof valor !== "number" || !Number.isFinite(valor)) return null;
  return valor >= min && valor <= max ? valor : null;
}

function textoCorto(valor: unknown): string | null {
  if (typeof valor !== "string") return null;
  const t = valor.trim();
  return t ? t.slice(0, 60) : null;
}

/**
 * Valida lo que devuelve el modelo. Todo lo que no tenga la forma o el rango
 * esperado queda en null, para que el usuario lo escriba a mano.
 */
export function validarDatosRecibo(crudo: unknown): DatosRecibo | null {
  if (!crudo || typeof crudo !== "object") return null;
  const d = crudo as Record<string, unknown>;
  const confianza =
    d.confianza === "alta" || d.confianza === "media" || d.confianza === "baja"
      ? d.confianza
      : "baja";
  return {
    consumoMensualKwh: numeroPlausible(d.consumoMensualKwh, 1, 1_000_000),
    valorPagadoMensual: numeroPlausible(d.valorPagadoMensual, 1_000, 1_000_000_000),
    periodoFacturado: textoCorto(d.periodoFacturado),
    ciudad: textoCorto(d.ciudad),
    confianza,
  };
}
