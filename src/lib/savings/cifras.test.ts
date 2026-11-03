import { describe, expect, it } from "vitest";
import { calcularAhorro } from "./calculate";
import { cifrasPrincipales, cuotaCredito } from "./cifras";
import { proyectar20Anios } from "./projection";
import type { AnalisisInput } from "./types";

function entrada(departamento: string, region: AnalisisInput["negocio"]["region"], valor: number): AnalisisInput {
  return {
    recibo: { fuente: "manual", consumoMensualKwh: 720, valorPagadoMensual: valor },
    negocio: { tipoNegocio: "tienda", region, departamento, cargasCriticas: [], horario: "dia" },
  };
}

describe("Cifras del resultado", () => {
  it("la gráfica de 20 años llega al equilibrio en el mismo año que 'Se paga en'", () => {
    for (const [dep, region, valor] of [
      ["La Guajira", "caribe", 650_000],
      ["Antioquia", "andina", 650_000],
      ["Chocó", "pacifico", 300_000],
    ] as const) {
      const paneles = calcularAhorro(entrada(dep, region, valor)).alternativas[0];
      const c = cifrasPrincipales(paneles);
      const p = proyectar20Anios({
        inversion: c.inversion,
        ahorroMensual: c.ahorroMensual,
        variacionTarifaPct: 0,
        degradacionPct: .5,
      });
      if (c.retornoMeses !== null && c.retornoMeses / 12 <= 20) {
        expect(p.retornoAnios!).toBeCloseTo(c.retornoMeses / 12, 6);
      }
    }
  });

  it("la cuota usa la tasa efectiva anual", () => {
    // 12 % E.A. a 1 año: la tasa mensual es (1,12)^(1/12) − 1, no 1 %.
    const cuota = cuotaCredito(1_200_000, 0.12, 1);
    expect(cuota).toBeGreaterThan(105_000);
    expect(cuota).toBeLessThan(106_600);
  });
});
