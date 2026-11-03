import { describe, expect, it } from "vitest";
import { formatCOPConSigno } from "./format";

describe("formatCOPConSigno", () => {
  it("muestra pesos con signo, a centenas", () => {
    expect(formatCOPConSigno(77_200).replace(/\s/g, " ")).toBe("+$ 77.200");
    expect(formatCOPConSigno(-90_040).replace(/\s/g, " ")).toBe("−$ 90.000");
  });
  it("sin diferencia dice igual", () => {
    expect(formatCOPConSigno(30)).toBe("igual");
  });
});
