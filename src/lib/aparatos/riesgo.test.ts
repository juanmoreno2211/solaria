import { describe, expect, it } from "vitest";
import { resumenRiesgo, riesgoDe } from "./riesgo";

describe("riesgo si se va y vuelve la luz", () => {
  it("sale del tipo de aparato", () => {
    expect(riesgoDe("nevera")).toBe("alto");
    expect(riesgoDe("computador")).toBe("medio");
    expect(riesgoDe("luces")).toBe("bajo");
    expect(riesgoDe("planta")).toBeNull();
    expect(riesgoDe(null)).toBeNull();
  });

  it("resume altos y medios", () => {
    expect(resumenRiesgo(["nevera", "aire", "datafono", "luces", null])).toBe(
      "Si se va y vuelve la luz: 2 con riesgo alto de dañarse y 1 con riesgo medio."
    );
    expect(resumenRiesgo(["camaras"])).toBe("Si se va y vuelve la luz: 1 con riesgo medio.");
  });

  it("no dice nada si solo hay riesgo bajo o aparatos sin tipo", () => {
    expect(resumenRiesgo(["luces", "ventilador", null])).toBeNull();
  });
});
