import { describe, expect, it } from "vitest";
import { simularAparato } from "@/lib/aparatos/simulador";
import { baseDelRecibo, fechaCorta, perfilParaSimular, reciboDelResultado, resultadoParaMostrar } from "./coherencia";

const perfil = { tipo: "tienda", departamento: "Atlántico", municipio: "Barranquilla", horario: "dia", conexion: "estable" };
const aire = { nombre: "Aire", tipo: "aire", cantidad: 1, potenciaW: 1100, factorCiclo: 0.5, horasDia: 8 };

// La calculadora guardó el resultado con 140 kWh el 2/11; después el negocio subió un recibo de 400 kWh.
const recibos = [
  { consumo_kwh: 400, valor: 360_000, origen: "manual", creado_en: "2026-11-20T15:00:00Z" },
  { consumo_kwh: 140, valor: 126_000, origen: "calculadora", creado_en: "2026-11-02T17:00:01Z" },
];
const entrada = {
  veredictoGuardado: "por_ahora_no" as const,
  guardadoEn: "2026-11-02T17:00:00Z",
  recibos,
  perfil,
  reciboActual: recibos[0],
  tarifa: 900,
};

describe("resultadoParaMostrar", () => {
  it("el veredicto de hoy es el mismo que el 'Hoy' del simulador", () => {
    const r = resultadoParaMostrar(entrada);
    const base = baseDelRecibo(recibos[0], 900)!;
    const sim = simularAparato({ perfil: perfilParaSimular(perfil)!, consumoKwh: base.consumoKwh, valor: base.valor, tarifaKwh: 900 }, aire);
    expect(r.actual?.veredicto).toBe(sim.veredictoAntes);
  });

  it("no dice 'todavía no lo necesitas' si con el recibo de hoy puede convenir", () => {
    const r = resultadoParaMostrar(entrada);
    expect(r.actual).toEqual({ veredicto: "comparar", consumoKwh: 400 });
    expect(r.guardado?.veredicto).toBe("por_ahora_no");
    expect(r.cambio).toBe(true);
  });

  it("el resultado guardado lleva su fecha y el consumo con que se calculó", () => {
    const r = resultadoParaMostrar(entrada);
    expect(r.guardado).toEqual({ veredicto: "por_ahora_no", fecha: "2026-11-02T17:00:00Z", consumoKwh: 140, valor: 126_000 });
    expect(fechaCorta(r.guardado!.fecha!)).toBe("2/11");
  });

  it("si el recibo es el mismo de la calculadora, no hay cambio", () => {
    const r = resultadoParaMostrar({ ...entrada, reciboActual: recibos[1], recibos: [recibos[1]] });
    expect(r.actual?.veredicto).toBe("por_ahora_no");
    expect(r.cambio).toBe(false);
  });

  it("sin perfil completo no recalcula: queda solo el guardado, con su fecha", () => {
    const r = resultadoParaMostrar({ ...entrada, perfil: { ...perfil, horario: null } });
    expect(r.actual).toBeNull();
    expect(r.guardado?.consumoKwh).toBe(140);
    expect(r.cambio).toBe(false);
  });

  it("sin resultado guardado, igual muestra el de hoy", () => {
    const r = resultadoParaMostrar({ ...entrada, veredictoGuardado: null, guardadoEn: null });
    expect(r.guardado).toBeNull();
    expect(r.actual?.veredicto).toBe("comparar");
  });
});

describe("reciboDelResultado", () => {
  it("toma el recibo de la calculadora guardado con el resultado, no uno manual posterior", () => {
    expect(reciboDelResultado(recibos, "2026-11-02T17:00:00Z")?.consumo_kwh).toBe(140);
  });

  it("ignora recibos de la calculadora guardados después (otro resultado)", () => {
    const despues = [...recibos, { consumo_kwh: 900, valor: 810_000, origen: "calculadora", creado_en: "2026-11-25T10:00:00Z" }];
    expect(reciboDelResultado(despues, "2026-11-02T17:00:00Z")?.consumo_kwh).toBe(140);
  });

  it("sin fecha no adivina", () => {
    expect(reciboDelResultado(recibos, null)).toBeNull();
  });
});

describe("baseDelRecibo", () => {
  it("completa con la tarifa el dato que falte (igual que antes en el simulador)", () => {
    expect(baseDelRecibo({ consumo_kwh: null, valor: 180_000 }, 900)).toEqual({ consumoKwh: 200, valor: 180_000 });
    expect(baseDelRecibo({ consumo_kwh: 200, valor: null }, 900)).toEqual({ consumoKwh: 200, valor: 180_000 });
    expect(baseDelRecibo(null, 900)).toBeNull();
    expect(baseDelRecibo({ consumo_kwh: 200, valor: 180_000 }, null)).toBeNull();
  });
});
