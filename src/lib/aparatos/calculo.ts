import { aparatoDelCatalogo } from "./catalogo";

export const DIAS_MES_DEFECTO = 30;

export interface UsoAparato {
  nombre: string;
  tipo?: string | null;
  cantidad: number;
  potenciaW: number;
  factorCiclo: number;
  horasDia: number;
  diasMes?: number;
  /** Consumo de la etiqueta energética por unidad; si está, manda sobre potencia × horas. */
  kwhAnioEtiqueta?: number | null;
}

/** Tarifa del recibo (valor ÷ kWh); null si falta alguno de los dos. */
export function tarifaDelRecibo(consumoKwh: number | null | undefined, valor: number | null | undefined): number | null {
  return consumoKwh && consumoKwh > 0 && valor && valor > 0 ? valor / consumoKwh : null;
}

/**
 * kWh al mes = potencia en kW × horas al día × días al mes × factor de ciclo × cantidad.
 * Con etiqueta: kWh al año × días al mes ÷ 365 × cantidad.
 * Una planta eléctrica no consume de la red: 0.
 */
export function kwhMes(a: UsoAparato): number {
  if (aparatoDelCatalogo(a.tipo)?.generaEnergia) return 0;
  const dias = a.diasMes ?? DIAS_MES_DEFECTO;
  if (a.kwhAnioEtiqueta && a.kwhAnioEtiqueta > 0) return (a.kwhAnioEtiqueta * dias * a.cantidad) / 365;
  return (a.potenciaW / 1000) * a.horasDia * dias * a.factorCiclo * a.cantidad;
}

export function costoMes(a: UsoAparato, tarifaKwh: number): number {
  return kwhMes(a) * tarifaKwh;
}

export interface FilaRanking<T extends UsoAparato = UsoAparato> {
  aparato: T;
  kwhMes: number;
  costoMes: number | null;
  /** Porcentaje de los kWh del recibo; null sin consumo en el recibo. */
  porcentajeRecibo: number | null;
}

export interface Ranking<T extends UsoAparato = UsoAparato> {
  filas: FilaRanking<T>[];
  kwhAparatos: number;
  /** kWh de los aparatos ÷ kWh del recibo × 100, sin escalar ni topar. */
  porcentajeExplicado: number | null;
  /** kWh del recibo que no explican los aparatos (0 si los aparatos suman más). */
  kwhOtros: number | null;
  costoOtros: number | null;
}

/** Ordena por costo (o kWh) de mayor a menor y compara contra el recibo sin forzar que cuadre. */
export function rankingAparatos<T extends UsoAparato>(
  aparatos: T[],
  tarifaKwh: number | null,
  consumoReciboKwh: number | null
): Ranking<T> {
  const filas = aparatos
    .map((aparato) => {
      const kwh = kwhMes(aparato);
      return {
        aparato,
        kwhMes: kwh,
        costoMes: tarifaKwh ? kwh * tarifaKwh : null,
        porcentajeRecibo: consumoReciboKwh && consumoReciboKwh > 0 ? (kwh / consumoReciboKwh) * 100 : null,
      };
    })
    .sort((a, b) => b.kwhMes - a.kwhMes);

  const kwhAparatos = filas.reduce((s, f) => s + f.kwhMes, 0);
  const hayRecibo = consumoReciboKwh != null && consumoReciboKwh > 0;
  const kwhOtros = hayRecibo ? Math.max(0, consumoReciboKwh - kwhAparatos) : null;
  return {
    filas,
    kwhAparatos,
    porcentajeExplicado: hayRecibo ? (kwhAparatos / consumoReciboKwh) * 100 : null,
    kwhOtros,
    costoOtros: kwhOtros != null && tarifaKwh ? kwhOtros * tarifaKwh : null,
  };
}
