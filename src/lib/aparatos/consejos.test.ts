import { describe, expect, it } from "vitest";
import { consejosPara } from "./consejos";
import type { UsoAparato } from "./calculo";

const aire: UsoAparato = { nombre: "Aire acondicionado", tipo: "aire", cantidad: 2, potenciaW: 1100, factorCiclo: 0.5, horasDia: 8 };

describe("consejosPara", () => {
  it("2 horas menos: ahorro exacto con los datos del usuario", () => {
    const [horas] = consejosPara(aire, 900);
    expect(horas.id).toBe("menos_horas");
    // 1,1 kW × 2 h × 30 d × 0,5 × 2 equipos × $900
    expect(horas.ahorroMes).toBeCloseTo(59_400, 6);
    expect(horas.texto).toContain("2 horas menos");
    expect(horas.texto).toContain("estimado");
    expect(horas.texto).toMatch(/59\.400/);
  });

  it("una unidad menos: el costo de un equipo", () => {
    const uno = consejosPara(aire, 900).find((c) => c.id === "una_unidad_menos");
    // 1,1 × 8 × 30 × 0,5 × $900
    expect(uno?.ahorroMes).toBeCloseTo(118_800, 6);
  });

  it("como máximo tres consejos y todos dicen estimado si tienen cifra", () => {
    const consejos = consejosPara(aire, 900);
    expect(consejos.length).toBeLessThanOrEqual(3);
    for (const c of consejos) if (c.ahorroMes !== null) expect(c.texto).toContain("estimado");
  });

  it("a la nevera no le sugiere usarla menos horas", () => {
    const nevera: UsoAparato = { nombre: "Nevera", tipo: "nevera", cantidad: 1, potenciaW: 725, factorCiclo: 1 / 3, horasDia: 24 };
    const ids = consejosPara(nevera, 900).map((c) => c.id);
    expect(ids).not.toContain("menos_horas");
    expect(ids).toContain("etiqueta");
  });

  it("con 2 horas de uso o menos, sugiere 1 hora menos", () => {
    const [c] = consejosPara({ ...aire, cantidad: 1, horasDia: 2 }, 900);
    expect(c.texto).toContain("1 hora menos");
    expect(c.ahorroMes).toBeCloseTo(1.1 * 30 * 0.5 * 900, 6);
  });

  it("sin tarifa no inventa pesos", () => {
    const consejos = consejosPara(aire, null);
    expect(consejos.every((c) => c.ahorroMes === null)).toBe(true);
  });

  it("con etiqueta no habla de horas ni pide la etiqueta", () => {
    const ids = consejosPara({ ...aire, kwhAnioEtiqueta: 800 }, 900).map((c) => c.id);
    expect(ids).toEqual(["una_unidad_menos"]);
  });
});
