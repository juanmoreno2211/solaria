import { describe, expect, it } from "vitest";
import { normalizarCelular, validarPedidoContacto } from "./cotizacion";

describe("normalizarCelular", () => {
  it("acepta celulares colombianos con espacios, guiones o +57", () => {
    expect(normalizarCelular("310 123 4567")).toBe("3101234567");
    expect(normalizarCelular("310-123-4567")).toBe("3101234567");
    expect(normalizarCelular("+57 310 123 4567")).toBe("3101234567");
    expect(normalizarCelular("573101234567")).toBe("3101234567");
  });

  it("rechaza fijos, números cortos y largos", () => {
    for (const malo of ["6012345678", "31012345", "31012345678", "", "abc"]) expect(normalizarCelular(malo)).toBeNull();
  });
});

describe("validarPedidoContacto", () => {
  it("pide nombre, celular válido y la autorización", () => {
    expect(validarPedidoContacto({ nombre: "", celular: "123", consentimiento: false })).toEqual({
      nombre: expect.any(String),
      celular: expect.any(String),
      consentimiento: expect.any(String),
    });
  });

  it("sin errores con datos completos", () => {
    expect(validarPedidoContacto({ nombre: "Rosa", celular: "310 123 4567", consentimiento: true })).toEqual({});
  });
});
