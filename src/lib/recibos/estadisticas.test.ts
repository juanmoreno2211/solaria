import { describe, expect, it } from "vitest";
import { calcularEstadisticas, calcularMetas, pendiente, recibosPorMes, type ReciboGuardado } from "./estadisticas";

const r = (mes: string, consumoKwh: number | null, valor: number | null, creadoEn = `${mes}T12:00:00Z`): ReciboGuardado => ({
  id: `${mes}-${creadoEn}`,
  mes,
  consumoKwh,
  valor,
  creadoEn,
});

const historial = [
  r("2026-07-01", 300, 270_000),
  r("2026-08-01", 320, 291_200),
  r("2026-09-01", 280, 257_600),
  r("2026-10-01", 360, 334_800),
];

describe("recibosPorMes", () => {
  it("deja un recibo por mes, el último guardado, en orden de mes", () => {
    const meses = recibosPorMes([
      r("2026-09-01", 200, 180_000, "2026-09-05T00:00:00Z"),
      r("2026-08-01", 250, 225_000),
      r("2026-09-01", 210, 189_000, "2026-09-20T00:00:00Z"),
    ]);
    expect(meses.map((m) => m.mes)).toEqual(["2026-08-01", "2026-09-01"]);
    expect(meses[1].consumoKwh).toBe(210);
    expect(meses[1].tarifa).toBe(900);
  });
});

describe("calcularEstadisticas", () => {
  const est = calcularEstadisticas(historial);

  it("promedios, último y anterior", () => {
    expect(est.promedioKwh).toBe(315);
    expect(est.ultimo?.mes).toBe("2026-10-01");
    expect(est.anterior?.mes).toBe("2026-09-01");
  });

  it("en pesos, la diferencia es en pesos (no otro porcentaje)", () => {
    // 334.800 − 257.600
    expect(est.cambioValor).toBe(77_200);
    expect(calcularEstadisticas([r("2026-09-01", 300, 270_000), r("2026-10-01", 200, 180_000)]).cambioValor).toBe(-90_000);
    expect(calcularEstadisticas([r("2026-10-01", 360, 334_800)]).cambioValor).toBeNull();
  });

  it("cambio contra el mes anterior y contra el promedio", () => {
    expect(est.cambioKwhPct).toBeCloseTo(((360 - 280) / 280) * 100, 6);
    expect(est.vsPromedioKwhPct).toBeCloseTo(((360 - 315) / 315) * 100, 6);
  });

  it("mejor y peor mes", () => {
    expect(est.mejorMes?.mes).toBe("2026-09-01");
    expect(est.peorMes?.mes).toBe("2026-10-01");
  });

  it("cambio de tarifa entre el primer y el último mes", () => {
    // 900 → 930 $/kWh
    expect(est.cambioTarifaPct).toBeCloseTo((30 / 900) * 100, 6);
  });

  it("tendencia por mínimos cuadrados", () => {
    // x = 0..3, y = 300, 320, 280, 360 → pendiente 14
    expect(est.tendenciaKwhMes).toBeCloseTo(14, 6);
  });

  it("con un solo recibo no hay comparaciones", () => {
    const uno = calcularEstadisticas([r("2026-10-01", 360, 334_800)]);
    expect(uno.cambioKwhPct).toBeNull();
    expect(uno.vsPromedioKwhPct).toBeNull();
    expect(uno.mejorMes).toBeNull();
    expect(uno.tendenciaKwhMes).toBeNull();
  });
});

describe("pendiente", () => {
  it("respeta los meses que faltan entre recibos", () => {
    expect(pendiente([{ x: 0, y: 100 }, { x: 2, y: 120 }, { x: 4, y: 140 }])).toBeCloseTo(10, 6);
  });
  it("con menos de 3 puntos no calcula", () => {
    expect(pendiente([{ x: 0, y: 1 }, { x: 1, y: 2 }])).toBeNull();
  });
});

describe("calcularMetas", () => {
  const est = calcularEstadisticas(historial);

  it("volver al promedio y al mejor mes, con ahorro = kWh de diferencia × tarifa", () => {
    const metas = calcularMetas(est, 930);
    const prom = metas.find((m) => m.id === "promedio")!;
    expect(prom.objetivoKwh).toBe(315);
    expect(prom.ahorroMes).toBeCloseTo(45 * 930, 6);
    const mejor = metas.find((m) => m.id === "mejor_mes")!;
    expect(mejor.objetivoKwh).toBe(280);
    expect(mejor.ahorroMes).toBeCloseTo(80 * 930, 6);
  });

  it("la meta del aparato baja el objetivo en los kWh de su ahorro", () => {
    const metas = calcularMetas(est, 900, { nombre: "Aire acondicionado", texto: "Si usas el aire 2 horas menos…", ahorroMes: 59_400 });
    const ap = metas.find((m) => m.id === "aparato")!;
    expect(ap.objetivoKwh).toBeCloseTo(360 - 66, 6);
    expect(ap.titulo).toBe("Ajusta: aire acondicionado");
  });

  it("si el último mes es el mejor, la meta es mantenerse", () => {
    const bajando = calcularEstadisticas([r("2026-08-01", 400, 360_000), r("2026-09-01", 350, 315_000), r("2026-10-01", 300, 270_000)]);
    const ids = calcularMetas(bajando, 900).map((m) => m.id);
    expect(ids).toContain("mantener");
    expect(ids).not.toContain("mejor_mes");
    expect(ids).not.toContain("promedio");
  });

  it("sin tarifa no pone pesos", () => {
    expect(calcularMetas(est, null).every((m) => m.ahorroMes === null)).toBe(true);
  });

  it("con pocos recibos pide más meses", () => {
    const ids = calcularMetas(calcularEstadisticas([r("2026-10-01", 360, 334_800)]), 930).map((m) => m.id);
    expect(ids).toContain("mas_recibos");
  });
});
