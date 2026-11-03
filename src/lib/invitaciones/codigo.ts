/**
 * Código del enlace /i/[codigo]. 32 símbolos sin los que se confunden al
 * leerlos o dictarlos (i, l, o, 1): 10 caracteres son 50 bits de azar, así
 * que adivinar uno de N códigos existentes cuesta del orden de 2^50 / N
 * intentos. La unicidad final la garantiza la base de datos (unique).
 */
export const ALFABETO = "abcdefghjkmnpqrstuvwxyz023456789";
export const LARGO_CODIGO = 10;
export const BITS_CODIGO = LARGO_CODIGO * Math.log2(ALFABETO.length);

const PATRON = new RegExp(`^[${ALFABETO}]{${LARGO_CODIGO}}$`);

export type FuenteAzar = (bytes: Uint8Array) => Uint8Array;

const azarSeguro: FuenteAzar = (bytes) => crypto.getRandomValues(bytes);

/**
 * 256 es múltiplo de 32: byte % 32 reparte todos los símbolos por igual, sin
 * sesgo. Usa el generador criptográfico, nunca Math.random.
 */
export function generarCodigo(azar: FuenteAzar = azarSeguro): string {
  const bytes = azar(new Uint8Array(LARGO_CODIGO));
  let codigo = "";
  for (const b of bytes) codigo += ALFABETO[b % ALFABETO.length];
  return codigo;
}

export function codigoValido(codigo: unknown): codigo is string {
  return typeof codigo === "string" && PATRON.test(codigo);
}

/** Lo que llega por la URL o un formulario: minúsculas, sin espacios; null si no sirve. */
export function normalizarCodigo(valor: unknown): string | null {
  if (typeof valor !== "string") return null;
  const limpio = valor.trim().toLowerCase();
  return codigoValido(limpio) ? limpio : null;
}
