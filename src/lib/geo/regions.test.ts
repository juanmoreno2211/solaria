import { describe, expect, it } from "vitest";
import map from "./colombia-departments.json";
import { DEPARTMENT_REGION, REGION_DEPARTMENTS } from "./regions";
import { DEPARTAMENTOS } from "../config/pricing";

describe("Ubicación del negocio", () => {
  it("permite pasar del mapa a la lista sin perder ningún departamento", () => {
    const names = map.locations.map((location) => location.name);
    const listed = Object.values(REGION_DEPARTMENTS).flat();
    expect(new Set(names).size).toBe(33);
    expect(new Set(listed).size).toBe(33);
    expect([...listed].sort()).toEqual([...names].sort());
  });

  it("el servidor reconoce las mismas selecciones que el mapa", () => {
    for (const location of map.locations) {
      const region = DEPARTMENT_REGION[location.name];
      expect(DEPARTAMENTOS[region]).toContain(location.name);
    }
  });
});
