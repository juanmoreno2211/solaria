import { describe, expect, it } from "vitest";
import { simularAparato, veredictoCalculadora, type BaseSimulacion, type FuncionVeredicto } from "./simulador";
import type { UsoAparato } from "./calculo";

const perfil: BaseSimulacion["perfil"] = {
  tipoNegocio: "tienda",
  region: "caribe",
  departamento: "Atlántico",
  horario: "dia",
  conexion: "estable",
};
const aire: UsoAparato = { nombre: "Aire acondicionado", tipo: "aire", cantidad: 1, potenciaW: 1100, factorCiclo: 0.5, horasDia: 8 };
const datafono: UsoAparato = { nombre: "Datáfono", tipo: "datafono", cantidad: 1, potenciaW: 5, factorCiclo: 1, horasDia: 10 };

describe("simularAparato", () => {
  it("calcula cuánto sube el recibo en pesos y en porcentaje", () => {
    const r = simularAparato({ perfil, consumoKwh: 400, valor: 360_000, tarifaKwh: 900 }, aire);
    expect(r.kwhExtra).toBeCloseTo(132, 6);
    expect(r.costoExtra).toBeCloseTo(118_800, 6);
    expect(r.porcentajeExtra).toBeCloseTo(33, 6);
  });

  it("usa la misma función de veredicto de la calculadora", () => {
    const base = { perfil, consumoKwh: 400, valor: 360_000, tarifaKwh: 900 };
    const r = simularAparato(base, datafono);
    expect(r.veredictoAntes).toBe(veredictoCalculadora(perfil, 400, 360_000));
  });

  it("el veredicto cambia: con 140 kWh no conviene y con un aire más sí hay que comparar", () => {
    const r = simularAparato({ perfil, consumoKwh: 140, valor: 126_000, tarifaKwh: 900 }, aire);
    expect(r.veredictoAntes).toBe("por_ahora_no");
    expect(r.veredictoDespues).toBe("comparar");
    expect(r.cambia).toBe(true);
    expect(r.muestraCotizacion).toBe(true);
  });

  it("un aparato pequeño no cambia el veredicto ni muestra la cotización", () => {
    const r = simularAparato({ perfil, consumoKwh: 140, valor: 126_000, tarifaKwh: 900 }, datafono);
    expect(r.cambia).toBe(false);
    expect(r.muestraCotizacion).toBe(false);
  });

  it("acepta otra función de veredicto (aislada de los proveedores)", () => {
    const umbral: FuncionVeredicto = (_, kwh) => (kwh >= 300 ? "conviene" : "por_ahora_no");
    const r = simularAparato({ perfil, consumoKwh: 200, valor: 180_000, tarifaKwh: 900 }, aire, umbral);
    expect(r.veredictoAntes).toBe("por_ahora_no");
    expect(r.veredictoDespues).toBe("conviene");
    expect(r.muestraCotizacion).toBe(true);
  });
});
