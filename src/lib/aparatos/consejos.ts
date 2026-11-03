import { formatCOP } from "@/lib/format";
import { costoMes, kwhMes, type UsoAparato } from "./calculo";

/** Aparatos que deben quedar prendidos todo el día: no se sugiere usarlos menos horas. */
const CONTINUOS = new Set(["nevera", "congelador", "camaras"]);

export interface Consejo {
  id: "menos_horas" | "una_unidad_menos" | "etiqueta";
  texto: string;
  /** Ahorro estimado en pesos al mes; null si el consejo no se puede cuantificar. */
  ahorroMes: number | null;
}

function pesos(valor: number): string {
  // Redondeado a centenas: es un estimado, no una cifra exacta del recibo.
  return formatCOP(Math.round(valor / 100) * 100);
}

/**
 * Hasta tres consejos sobre el aparato que más pesa. El ahorro sale solo de
 * aritmética con los datos del usuario (menos horas, una unidad menos), sin
 * porcentajes de ahorro genéricos.
 */
export function consejosPara(aparato: UsoAparato, tarifaKwh: number | null): Consejo[] {
  const consejos: Consejo[] = [];
  if (kwhMes(aparato) <= 0) return consejos;
  const nombre = aparato.nombre.toLowerCase();
  const conEtiqueta = Boolean(aparato.kwhAnioEtiqueta && aparato.kwhAnioEtiqueta > 0);

  if (tarifaKwh && !conEtiqueta && !CONTINUOS.has(aparato.tipo ?? "") && aparato.horasDia > 1) {
    const menos = aparato.horasDia > 2 ? 2 : 1;
    const ahorro = costoMes(aparato, tarifaKwh) - costoMes({ ...aparato, horasDia: aparato.horasDia - menos }, tarifaKwh);
    consejos.push({
      id: "menos_horas",
      texto: `Si usas ${nombre} ${menos === 1 ? "1 hora" : `${menos} horas`} menos al día, ahorras ~${pesos(ahorro)} al mes (estimado).`,
      ahorroMes: ahorro,
    });
  }

  if (tarifaKwh && aparato.cantidad > 1) {
    const ahorro = costoMes(aparato, tarifaKwh) / aparato.cantidad;
    consejos.push({
      id: "una_unidad_menos",
      texto: `Si dejas de usar uno de tus ${aparato.cantidad} (${nombre}), ahorras ~${pesos(ahorro)} al mes (estimado).`,
      ahorroMes: ahorro,
    });
  }

  if (!conEtiqueta) {
    consejos.push({
      id: "etiqueta",
      texto: `Busca la etiqueta energética o la placa de ${nombre}: con su consumo real (kWh al año) o su potencia, el cálculo deja de usar el valor de referencia.`,
      ahorroMes: null,
    });
  }

  return consejos.slice(0, 3);
}
