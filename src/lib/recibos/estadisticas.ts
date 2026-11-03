/**
 * Estadísticas y metas a partir de los recibos guardados. Todo sale de
 * aritmética con los datos del usuario: promedios, diferencias y una recta de
 * mínimos cuadrados para la tendencia. Ningún porcentaje de ahorro genérico.
 */

export interface ReciboGuardado {
  id: string;
  /** Primer día del mes, "AAAA-MM-01". */
  mes: string;
  consumoKwh: number | null;
  valor: number | null;
  creadoEn: string;
}

export interface MesConsumo {
  id: string;
  mes: string;
  consumoKwh: number | null;
  valor: number | null;
  tarifa: number | null;
}

/** Un recibo por mes (el último que se guardó para ese mes), del más viejo al más nuevo. */
export function recibosPorMes(recibos: ReciboGuardado[]): MesConsumo[] {
  const porMes = new Map<string, ReciboGuardado>();
  for (const r of recibos) {
    const actual = porMes.get(r.mes);
    if (!actual || r.creadoEn > actual.creadoEn) porMes.set(r.mes, r);
  }
  return [...porMes.values()]
    .sort((a, b) => a.mes.localeCompare(b.mes))
    .map((r) => ({
      id: r.id,
      mes: r.mes,
      consumoKwh: r.consumoKwh,
      valor: r.valor,
      tarifa: r.consumoKwh && r.consumoKwh > 0 && r.valor && r.valor > 0 ? r.valor / r.consumoKwh : null,
    }));
}

function promedio(valores: number[]): number | null {
  return valores.length ? valores.reduce((s, v) => s + v, 0) / valores.length : null;
}

function cambioPct(nuevo: number | null, viejo: number | null): number | null {
  return nuevo != null && viejo != null && viejo > 0 ? ((nuevo - viejo) / viejo) * 100 : null;
}

/** Pendiente de mínimos cuadrados (unidades por mes). Usa la distancia real en meses entre recibos. */
export function pendiente(puntos: { x: number; y: number }[]): number | null {
  if (puntos.length < 3) return null;
  const mx = promedio(puntos.map((p) => p.x))!;
  const my = promedio(puntos.map((p) => p.y))!;
  const den = puntos.reduce((s, p) => s + (p.x - mx) ** 2, 0);
  if (den === 0) return null;
  return puntos.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0) / den;
}

function indiceMes(mes: string): number {
  const [a, m] = mes.split("-").map(Number);
  return a * 12 + (m - 1);
}

export interface Estadisticas {
  meses: MesConsumo[];
  ultimo: MesConsumo | null;
  anterior: MesConsumo | null;
  promedioKwh: number | null;
  promedioValor: number | null;
  /** Último mes contra el anterior con dato. */
  cambioKwhPct: number | null;
  cambioValorPct: number | null;
  /** Último mes contra el promedio de todos. */
  vsPromedioKwhPct: number | null;
  mejorMes: MesConsumo | null;
  peorMes: MesConsumo | null;
  /** kWh por mes que sube (+) o baja (−) la tendencia; null con menos de 3 meses. */
  tendenciaKwhMes: number | null;
  /** Cambio de la tarifa entre el primer y el último mes con tarifa. */
  cambioTarifaPct: number | null;
}

export function calcularEstadisticas(recibos: ReciboGuardado[]): Estadisticas {
  const meses = recibosPorMes(recibos);
  const conKwh = meses.filter((m) => m.consumoKwh != null);
  const conValor = meses.filter((m) => m.valor != null);
  const conTarifa = meses.filter((m) => m.tarifa != null);
  const ultimo = meses.at(-1) ?? null;
  const anterior = meses.length > 1 ? meses.at(-2)! : null;
  const promedioKwh = promedio(conKwh.map((m) => m.consumoKwh!));
  const ordenKwh = [...conKwh].sort((a, b) => a.consumoKwh! - b.consumoKwh!);

  return {
    meses,
    ultimo,
    anterior,
    promedioKwh,
    promedioValor: promedio(conValor.map((m) => m.valor!)),
    cambioKwhPct: cambioPct(ultimo?.consumoKwh ?? null, anterior?.consumoKwh ?? null),
    cambioValorPct: cambioPct(ultimo?.valor ?? null, anterior?.valor ?? null),
    vsPromedioKwhPct: conKwh.length > 1 ? cambioPct(ultimo?.consumoKwh ?? null, promedioKwh) : null,
    mejorMes: conKwh.length > 1 ? ordenKwh[0] : null,
    peorMes: conKwh.length > 1 ? ordenKwh.at(-1)! : null,
    tendenciaKwhMes: pendiente(conKwh.map((m) => ({ x: indiceMes(m.mes), y: m.consumoKwh! }))),
    cambioTarifaPct: conTarifa.length > 1 ? cambioPct(conTarifa.at(-1)!.tarifa, conTarifa[0].tarifa) : null,
  };
}

export interface Meta {
  id: "promedio" | "mejor_mes" | "aparato" | "mantener" | "mas_recibos";
  titulo: string;
  detalle: string;
  /** kWh al mes que habría que alcanzar; null si la meta no es de consumo. */
  objetivoKwh: number | null;
  /** Ahorro estimado al mes si se cumple, con la tarifa del usuario. */
  ahorroMes: number | null;
}

/** Consejo cuantificado sobre un aparato del ranking (de consejosPara). */
export interface AhorroAparato {
  nombre: string;
  texto: string;
  ahorroMes: number;
}

/**
 * Metas según el uso: volver al promedio, igualar el mejor mes y el consejo
 * del aparato que más pesa entre los que se pueden ajustar. El ahorro es la diferencia de kWh × la tarifa.
 */
export function calcularMetas(est: Estadisticas, tarifaKwh: number | null, aparato?: AhorroAparato | null): Meta[] {
  const metas: Meta[] = [];
  const ultimoKwh = est.ultimo?.consumoKwh ?? null;
  const ahorro = (kwh: number) => (tarifaKwh ? kwh * tarifaKwh : null);

  if (ultimoKwh != null && est.promedioKwh != null && est.mejorMes && ultimoKwh > est.promedioKwh) {
    const diferencia = ultimoKwh - est.promedioKwh;
    metas.push({
      id: "promedio",
      titulo: `Vuelve a tu promedio: ${Math.round(est.promedioKwh)} kWh al mes`,
      detalle: `Tu último recibo marcó ${Math.round(diferencia)} kWh más que tu promedio.`,
      objetivoKwh: est.promedioKwh,
      ahorroMes: ahorro(diferencia),
    });
  }

  if (ultimoKwh != null && est.mejorMes && est.mejorMes.consumoKwh! < ultimoKwh) {
    const diferencia = ultimoKwh - est.mejorMes.consumoKwh!;
    metas.push({
      id: "mejor_mes",
      titulo: `Iguala tu mejor mes: ${Math.round(est.mejorMes.consumoKwh!)} kWh`,
      detalle: `Ya lo lograste antes. Son ${Math.round(diferencia)} kWh menos que tu último recibo.`,
      objetivoKwh: est.mejorMes.consumoKwh,
      ahorroMes: ahorro(diferencia),
    });
  }

  if (aparato && aparato.ahorroMes > 0 && tarifaKwh) {
    const kwh = aparato.ahorroMes / tarifaKwh;
    metas.push({
      id: "aparato",
      titulo: `Ajusta: ${aparato.nombre.toLowerCase()}`,
      detalle: aparato.texto,
      objetivoKwh: ultimoKwh != null ? Math.max(0, ultimoKwh - kwh) : null,
      ahorroMes: aparato.ahorroMes,
    });
  }

  if (ultimoKwh != null && est.mejorMes && est.mejorMes.consumoKwh! >= ultimoKwh) {
    metas.push({
      id: "mantener",
      titulo: `Mantente por debajo de ${Math.round(ultimoKwh)} kWh`,
      detalle: "Tu último mes es el más bajo que has registrado. La meta es no subir.",
      objetivoKwh: ultimoKwh,
      ahorroMes: null,
    });
  }

  if (est.meses.length < 3) {
    metas.push({
      id: "mas_recibos",
      titulo: "Agrega los recibos de otros meses",
      detalle: `Con ${est.meses.length === 0 ? "tus recibos" : `${3 - est.meses.length} más`} vemos si tu consumo sube o baja con el tiempo.`,
      objetivoKwh: null,
      ahorroMes: null,
    });
  }

  return metas.slice(0, 4);
}
