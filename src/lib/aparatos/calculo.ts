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
  /** Si los aparatos suman más que el recibo, ya viene ajustado al recibo. */
  kwhMes: number;
  costoMes: number | null;
  /** Porcentaje de los kWh del recibo; null sin consumo en el recibo. */
  porcentajeRecibo: number | null;
}

export interface Ranking<T extends UsoAparato = UsoAparato> {
  filas: FilaRanking<T>[];
  /** kWh de los aparatos antes de ajustar al recibo. */
  kwhAparatos: number;
  /** kWh de los aparatos ÷ kWh del recibo × 100, antes de ajustar (puede pasar de 100). */
  porcentajeExplicado: number | null;
  /** true si los aparatos sumaban más que el recibo y se repartió el recibo entre ellos. */
  ajustadoAlRecibo: boolean;
  /** kWh del recibo que no explican los aparatos (0 si los aparatos suman más). */
  kwhOtros: number | null;
  costoOtros: number | null;
}

/**
 * Ordena por kWh de mayor a menor y compara contra el recibo. Si los aparatos
 * suman más que el recibo, reparte los kWh del recibo en la misma proporción:
 * el recibo es el dato medido y los valores de referencia son estimados.
 */
export function rankingAparatos<T extends UsoAparato>(
  aparatos: T[],
  tarifaKwh: number | null,
  consumoReciboKwh: number | null
): Ranking<T> {
  const estimados = aparatos.map((aparato) => ({ aparato, kwh: kwhMes(aparato) }));
  const kwhAparatos = estimados.reduce((s, e) => s + e.kwh, 0);
  const hayRecibo = consumoReciboKwh != null && consumoReciboKwh > 0;
  const ajustadoAlRecibo = hayRecibo && kwhAparatos > consumoReciboKwh;
  const escala = ajustadoAlRecibo ? consumoReciboKwh / kwhAparatos : 1;

  const filas = estimados
    .map(({ aparato, kwh: estimado }) => {
      const kwh = estimado * escala;
      return {
        aparato,
        kwhMes: kwh,
        costoMes: tarifaKwh ? kwh * tarifaKwh : null,
        porcentajeRecibo: hayRecibo ? (kwh / consumoReciboKwh) * 100 : null,
      };
    })
    .sort((a, b) => b.kwhMes - a.kwhMes);

  const kwhOtros = hayRecibo ? Math.max(0, consumoReciboKwh - kwhAparatos) : null;
  return {
    filas,
    kwhAparatos,
    porcentajeExplicado: hayRecibo ? (kwhAparatos / consumoReciboKwh) * 100 : null,
    ajustadoAlRecibo,
    kwhOtros,
    costoOtros: kwhOtros != null && tarifaKwh ? kwhOtros * tarifaKwh : null,
  };
}
