import { describe, expect, it } from "vitest";
import { ALFABETO, BITS_CODIGO, LARGO_CODIGO, codigoValido, generarCodigo, normalizarCodigo } from "./codigo";

describe("generarCodigo", () => {
  it("10 caracteres del alfabeto sin símbolos confusos", () => {
    const codigo = generarCodigo();
    expect(codigo).toHaveLength(LARGO_CODIGO);
    expect(codigoValido(codigo)).toBe(true);
    expect(ALFABETO).not.toMatch(/[il1o]/);
    expect(new Set(ALFABETO).size).toBe(32);
  });

  it("difícil de adivinar: al menos 48 bits de azar", () => {
    expect(BITS_CODIGO).toBeGreaterThanOrEqual(48);
  });

  it("no se repite en 50.000 códigos", () => {
    const codigos = new Set(Array.from({ length: 50_000 }, () => generarCodigo()));
    expect(codigos.size).toBe(50_000);
  });

  it("reparte los símbolos de forma pareja (sin sesgo del módulo)", () => {
    const cuenta = new Map<string, number>();
    for (let i = 0; i < 20_000; i++) for (const c of generarCodigo()) cuenta.set(c, (cuenta.get(c) ?? 0) + 1);
    const esperado = (20_000 * LARGO_CODIGO) / 32;
    expect(cuenta.size).toBe(32);
    for (const n of cuenta.values()) expect(Math.abs(n - esperado) / esperado).toBeLessThan(0.08);
  });

  it("cada byte se traduce a su símbolo (byte % 32)", () => {
    const fija = (b: Uint8Array) => b.map((_, i) => i * 33);
    expect(generarCodigo(fija)).toBe([0, 33, 66, 99, 132, 165, 198, 231, 264 % 256, 297 % 256].map((b) => ALFABETO[b % 32]).join(""));
  });

  it("usa el generador criptográfico, no Math.random", () => {
    const original = Math.random;
    Math.random = () => {
      throw new Error("Math.random no debe usarse");
    };
    try {
      expect(codigoValido(generarCodigo())).toBe(true);
    } finally {
      Math.random = original;
    }
  });
});

describe("codigoValido y normalizarCodigo", () => {
  it("rechaza largos, símbolos y tipos que no son", () => {
    for (const malo of ["", "abc", "abcdefghjkm", "abcdefghj1", "ABCDEFGHJK!", "abcdefghjl", null, 42, "a b c d e f"]) {
      expect(codigoValido(malo)).toBe(false);
    }
  });

  it("acepta mayúsculas y espacios alrededor, y los normaliza", () => {
    expect(normalizarCodigo("  ABCDEFGHJK ")).toBe("abcdefghjk");
    expect(normalizarCodigo("abc' or 1=1")).toBeNull();
  });
});
