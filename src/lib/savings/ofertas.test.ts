import { describe, expect, it } from "vitest";
import type { CatalogoPanelSistema } from "@/lib/catalog/types";
import { calcularOfertas, elegirMejorOferta } from "./ofertas";

const SISTEMAS: CatalogoPanelSistema[] = [
  {
    proveedor: "Proveedor 1",
    nombreSistema: "Sistema",
    kwpMin: 1,
    kwpMax: 50,
    precioPorKwpCOP: 4_200_000,
    regiones: ["caribe", "andina", "pacifico"],
    financiacion: { cuotaInicialPct: 0.3, tasaMensual: 0.017, plazoMeses: 36 },
    esSimulado: true,
  },
  {
    proveedor: "Proveedor 2",
    nombreSistema: "Sistema",
    kwpMin: 3,
    kwpMax: 50,
    precioPorKwpCOP: 3_600_000,
    regiones: ["caribe", "andina", "orinoquia"],
    financiacion: null,
    esSimulado: true,
  },
];

describe("calcularOfertas (kWp = 4,5 y ahorro = $608.000)", () => {
  const [p1, p2] = calcularOfertas(4.5, 608_000, "caribe", SISTEMAS);

  it("Proveedor 1 financia", () => {
    expect(p1.aplica).toBe(true);
    expect(p1.inversion).toBe(18_900_000);
    expect(p1.retornoMeses! / 12).toBeCloseTo(2.7, 1);
    expect(p1.financiacion!.cuotaMensual).toBeCloseTo(494_000, -3);
    expect(p1.financiacion!.flujoMensual).toBeCloseTo(90_000, -3);
    expect(p1.primerPago).toBeUndefined();
  });

  it("Proveedor 2 no financia", () => {
    expect(p2.aplica).toBe(true);
    expect(p2.inversion).toBe(16_200_000);
    expect(p2.retornoMeses! / 12).toBeCloseTo(2.3, 1);
    expect(p2.financiacion).toBeUndefined();
    expect(p2.primerPago).toBe(8_100_000);
  });

  it("la mejor oferta es la de menor retorno", () => {
    expect(elegirMejorOferta([p1, p2])?.proveedor).toBe("Proveedor 2");
  });
});

describe("reglas de aplicación", () => {
  it("un sistema pequeño no aplica para quien instala desde 3 kWp", () => {
    const [p1, p2] = calcularOfertas(1.6, 200_000, "caribe", SISTEMAS);
    expect(p1.aplica).toBe(true);
    expect(p2.aplica).toBe(false);
    expect(p2.motivoNoAplica).toBe("Instala desde 3 kWp y tu sistema sería de 1,6 kWp.");
  });

  it("una región sin cobertura no tiene ofertas que apliquen", () => {
    const ofertas = calcularOfertas(4.5, 608_000, "amazonia", SISTEMAS);
    expect(ofertas.every((o) => !o.aplica)).toBe(true);
    expect(ofertas[0].motivoNoAplica).toBe("Todavía no llega a tu región.");
    expect(elegirMejorOferta(ofertas)).toBeUndefined();
  });
});
