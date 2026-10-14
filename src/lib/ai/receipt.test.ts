import { describe, expect, it } from "vitest";
import { validarDatosRecibo, validarImagenRecibo } from "./receipt";

describe("validarImagenRecibo", () => {
  it("acepta JPG, PNG y WEBP de hasta 4 MB", () => {
    expect(validarImagenRecibo("image/jpeg", 1_000_000)).toBeNull();
    expect(validarImagenRecibo("image/webp", 4 * 1024 * 1024)).toBeNull();
  });
  it("rechaza otros formatos y fotos de más de 4 MB", () => {
    expect(validarImagenRecibo("image/gif", 1000)).toMatch(/JPG, PNG o WEBP/);
    expect(validarImagenRecibo("image/png", 4 * 1024 * 1024 + 1)).toMatch(/4 MB/);
  });
});

describe("validarDatosRecibo", () => {
  it("conserva lo que tiene forma y rango esperados", () => {
    expect(
      validarDatosRecibo({
        consumoMensualKwh: 720,
        valorPagadoMensual: 760000,
        periodoFacturado: "Sep 2026",
        ciudad: "Riohacha",
        confianza: "alta",
      })
    ).toEqual({
      consumoMensualKwh: 720,
      valorPagadoMensual: 760000,
      periodoFacturado: "Sep 2026",
      ciudad: "Riohacha",
      confianza: "alta",
    });
  });
  it("deja en null lo que no se puede creer", () => {
    expect(
      validarDatosRecibo({
        consumoMensualKwh: "720",
        valorPagadoMensual: 760, // "760.000" mal leído como 760
        periodoFacturado: "  ",
        ciudad: null,
        confianza: "segura",
      })
    ).toEqual({
      consumoMensualKwh: null,
      valorPagadoMensual: null,
      periodoFacturado: null,
      ciudad: null,
      confianza: "baja",
    });
    expect(validarDatosRecibo("no es json")).toBeNull();
  });
});
