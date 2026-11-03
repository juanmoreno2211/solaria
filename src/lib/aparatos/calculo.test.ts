import { describe, expect, it } from "vitest";
import { aparatoDelCatalogo, CATALOGO_APARATOS } from "./catalogo";
import { costoMes, kwhMes, rankingAparatos, tarifaDelRecibo, type UsoAparato } from "./calculo";

const nevera: UsoAparato = { nombre: "Nevera", tipo: "nevera", cantidad: 1, potenciaW: 725, factorCiclo: 1 / 3, horasDia: 24 };
const aire: UsoAparato = { nombre: "Aire", tipo: "aire", cantidad: 1, potenciaW: 1100, factorCiclo: 0.5, horasDia: 8 };
const luces: UsoAparato = { nombre: "Bombillo LED", tipo: "luces", cantidad: 10, potenciaW: 10, factorCiclo: 1, horasDia: 12 };

describe("kwhMes", () => {
  it("nevera: aplica el factor de ciclo (0,725 kW × 24 h × 30 d × 1/3)", () => {
    expect(kwhMes(nevera)).toBeCloseTo(174, 6);
  });

  it("aire: 1,1 kW × 8 h × 30 d × 0,5", () => {
    expect(kwhMes(aire)).toBeCloseTo(132, 6);
  });

  it("luces: factor 1 y multiplica por cantidad (0,01 kW × 12 h × 30 d × 10)", () => {
    expect(kwhMes(luces)).toBeCloseTo(36, 6);
  });

  it("respeta los días al mes editables", () => {
    expect(kwhMes({ ...luces, diasMes: 26 })).toBeCloseTo(0.01 * 12 * 26 * 10, 6);
  });

  it("la etiqueta energética manda sobre potencia × horas", () => {
    expect(kwhMes({ ...nevera, kwhAnioEtiqueta: 365, cantidad: 2 })).toBeCloseTo(60, 6);
  });

  it("la planta eléctrica no suma al recibo", () => {
    expect(kwhMes({ nombre: "Planta", tipo: "planta", cantidad: 1, potenciaW: 5000, factorCiclo: 1, horasDia: 4 })).toBe(0);
  });
});

describe("tarifa y costo", () => {
  it("tarifa = valor ÷ kWh", () => {
    expect(tarifaDelRecibo(200, 180_000)).toBe(900);
    expect(tarifaDelRecibo(null, 180_000)).toBeNull();
    expect(tarifaDelRecibo(200, 0)).toBeNull();
  });

  it("costo = kWh × tarifa", () => {
    expect(costoMes(aire, 900)).toBeCloseTo(118_800, 6);
  });
});

describe("rankingAparatos", () => {
  it("ordena de mayor a menor y calcula el % del recibo sin escalar", () => {
    const r = rankingAparatos([luces, aire, nevera], 900, 400);
    expect(r.filas.map((f) => f.aparato.nombre)).toEqual(["Nevera", "Aire", "Bombillo LED"]);
    expect(r.filas[0].porcentajeRecibo).toBeCloseTo(43.5, 6);
    expect(r.kwhAparatos).toBeCloseTo(342, 6);
    expect(r.porcentajeExplicado).toBeCloseTo(85.5, 6);
    expect(r.kwhOtros).toBeCloseTo(58, 6);
    expect(r.costoOtros).toBeCloseTo(52_200, 6);
  });

  it("si los aparatos suman más que el recibo, no recorta: pasa de 100 % y otros queda en 0", () => {
    const r = rankingAparatos([nevera, aire], 900, 200);
    expect(r.porcentajeExplicado).toBeCloseTo(153, 6);
    expect(r.kwhOtros).toBe(0);
  });

  it("sin recibo no hay porcentajes ni costo", () => {
    const r = rankingAparatos([aire], null, null);
    expect(r.filas[0].costoMes).toBeNull();
    expect(r.porcentajeExplicado).toBeNull();
    expect(r.kwhOtros).toBeNull();
  });
});

describe("catálogo", () => {
  it("cada aparato trae fuente y factor de ciclo entre 0 y 1", () => {
    for (const a of CATALOGO_APARATOS) {
      expect(a.fuente.length, a.tipo).toBeGreaterThan(0);
      expect(a.factorCiclo, a.tipo).toBeGreaterThan(0);
      expect(a.factorCiclo, a.tipo).toBeLessThanOrEqual(1);
    }
    expect(aparatoDelCatalogo("luces")?.factorCiclo).toBe(1);
    expect(aparatoDelCatalogo("computador")?.factorCiclo).toBe(1);
  });
});
