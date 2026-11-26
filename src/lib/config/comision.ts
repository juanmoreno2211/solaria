import { formatDecimal } from "@/lib/format";

/** Comisión que el proveedor le paga a SolarIA si cierra la venta. Cámbiala aquí. */
export const COMISION_PROVEEDOR_PCT = 2.5;

export const TEXTO_COMISION = `Si pides cotización y cierras con un proveedor, él nos paga una comisión del ${formatDecimal(COMISION_PROVEEDOR_PCT)} %.`;
