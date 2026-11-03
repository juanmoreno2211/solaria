import { describe, expect, it } from "vitest";
import { guardarEnDestinos } from "./destinos";

describe("guardarEnDestinos", () => {
  it("con los dos bien, ok y nada falló", async () => {
    expect(await guardarEnDestinos({ supabase: async () => true, hoja: async () => true })).toEqual({ ok: true, fallaron: [] });
  });

  it("si uno falla (o lanza un error), la solicitud no se pierde y se informa cuál", async () => {
    expect(await guardarEnDestinos({ supabase: async () => true, hoja: async () => false })).toEqual({ ok: true, fallaron: ["hoja"] });
    expect(
      await guardarEnDestinos({
        supabase: async () => {
          throw new Error("caído");
        },
        hoja: async () => true,
      })
    ).toEqual({ ok: true, fallaron: ["supabase"] });
  });

  it("si fallan los dos, no está ok", async () => {
    expect(await guardarEnDestinos({ supabase: async () => false, hoja: async () => false })).toEqual({ ok: false, fallaron: ["supabase", "hoja"] });
  });
});
