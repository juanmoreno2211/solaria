import { describe, expect, it } from "vitest";
import map from "./colombia-departments.json";
import { DATOS_DEPARTAMENTO, HSP_ESCALA, hspParaCalculo } from "./departamentos";
import { regionForDepartment } from "./regions";
import { CENTROS_DEPARTAMENTOS } from "./centros-departamentos";
import { calcularAhorro } from "../savings/calculate";
import type { AnalisisInput } from "../savings/types";

function entrada(departamento: string): AnalisisInput {
  return {
    recibo: { fuente: "manual", consumoMensualKwh: 1000, valorPagadoMensual: 920_000 },
    negocio: {
      tipoNegocio: "tienda",
      region: regionForDepartment(departamento)!,
      departamento,
      cargasCriticas: [],
      horario: "dia",
    },
  };
}

describe("Sol por departamento", () => {
  it("cada departamento del mapa tiene horas de sol pico", () => {
    for (const { name } of map.locations) {
      const d = DATOS_DEPARTAMENTO[name];
      expect(d, name).toBeDefined();
      expect(d.hspMin).toBeLessThanOrEqual(d.hspMax);
      expect(d.hspMin).toBeGreaterThanOrEqual(HSP_ESCALA.min);
      expect(d.hspMax).toBeLessThanOrEqual(HSP_ESCALA.max);
    }
    expect(Object.keys(DATOS_DEPARTAMENTO).sort()).toEqual(map.locations.map((l) => l.name).sort());
  });

  it("cada departamento tiene dónde poner el pin del mapa", () => {
    for (const { name } of map.locations) expect(CENTROS_DEPARTAMENTOS[name], name).toBeDefined();
  });

  it("usa el punto medio del rango (Bogotá ≈ 4 HSP)", () => {
    expect(hspParaCalculo("Bogotá D.C.")).toBe(4);
    expect(hspParaCalculo("La Guajira")).toBe(5.75);
    expect(hspParaCalculo("toString")).toBeUndefined();
    expect(regionForDepartment("toString")).toBeUndefined();
  });

  it("el cálculo cambia con el departamento, no con la región", () => {
    const guajira = calcularAhorro(entrada("La Guajira"));
    const atlantico = calcularAhorro(entrada("Atlántico"));
    // Misma región (Caribe), distinto sol: más sol, sistema más pequeño.
    expect(guajira.ubicacion.fuente).toBe("departamento");
    expect(guajira.alternativas[0].kwpRequeridos).toBeLessThan(atlantico.alternativas[0].kwpRequeridos);
  });
});