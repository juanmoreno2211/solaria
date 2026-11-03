export function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-CO").format(value);
}

/** Pesos redondeados a miles, como se muestran las cifras estimadas. */
export function formatCOPMiles(value: number): string {
  return formatCOP(Math.round(value / 1000) * 1000);
}

/** Número con un decimal y coma decimal, p. ej. 1,6. */
export function formatDecimal(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 1,
  }).format(Math.round(value * 10) / 10);
}

/** Diferencia en pesos con signo, a centenas: "+$ 72.000", "−$ 18.000" o "igual". */
export function formatCOPConSigno(diferencia: number): string {
  const redondeada = Math.round(diferencia / 100) * 100;
  if (redondeada === 0) return "igual";
  return `${redondeada > 0 ? "+" : "−"}${formatCOP(Math.abs(redondeada))}`;
}
