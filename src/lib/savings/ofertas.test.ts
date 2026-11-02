import { describe, expect, it } from "vitest";
import catalogoJson from "@/lib/catalog/data/catalogo.json";
import type { CatalogoData, CatalogoPanelSistema } from "@/lib/catalog/types";
import { SUNVOLT_ESTIMACION } from "@/lib/config/pricing";
import { elegirPlan } from "@/lib/catalog/lookup";
import { calcularOfertas, elegirMejorOferta, simularPago } from "./ofertas";

const SISTEMAS: CatalogoPanelSistema[] = [
  {
    proveedor: "Proveedor 1",
    nombreSistema: "Sistema",
    kwpMin: 1,
    kwpMax: 50,
    precioPorKwpCOP: 4_200_000,
    regiones: ["caribe", "andina", "pacifico"],
    financiacion: { cuotaInicialPct: 0.3, tasaMensual: 0.017, plazoMeses: 36 },
    estadoDatos: "simulado",
  },
  {
    proveedor: "Proveedor 2",
    nombreSistema: "Sistema",
    kwpMin: 3,
    kwpMax: 50,
    precioPorKwpCOP: 3_600_000,
    regiones: ["caribe", "andina", "orinoquia"],
    financiacion: null,
    estadoDatos: "simulado",
  },
];

describe("calcularOfertas (kWp = 4,5 y ahorro = $608.000)", () => {
  const [p1, p2] = calcularOfertas(4.5, 608_000, { region: "caribe" }, SISTEMAS);

  it("Proveedor 1 financia", () => {
    expect(p1.aplica).toBe(true);
    expect(p1.inversion).toBe(18_900_000);
    expect(p1.retornoMeses! / 12).toBeCloseTo(2.7, 1);
    expect(p1.financiacion!.cuotaMensual).toBeCloseTo(494_000, -3);
    expect(p1.financiacion!.flujoMensual).toBeCloseTo(90_000, -3);
    expect(p1.primerPago).toBeUndefined();
  });

  it("Proveedor 2 no financia", () => {
    expect(p2.aplica).toBe(true);
    expect(p2.inversion).toBe(16_200_000);
    expect(p2.retornoMeses! / 12).toBeCloseTo(2.3, 1);
    expect(p2.financiacion).toBeUndefined();
    expect(p2.primerPago).toBe(8_100_000);
  });

  it("la mejor oferta es la de menor retorno", () => {
    expect(elegirMejorOferta([p1, p2])?.proveedor).toBe("Proveedor 2");
  });
});

describe("reglas de aplicación", () => {
  it("un sistema pequeño no aplica para quien instala desde 3 kWp", () => {
    const [p1, p2] = calcularOfertas(1.6, 200_000, { region: "caribe" }, SISTEMAS);
    expect(p1.aplica).toBe(true);
    expect(p2.aplica).toBe(false);
    expect(p2.motivoNoAplica).toBe("Instala desde 3 kWp y tu sistema sería de 1,6 kWp.");
  });

  it("una región sin cobertura no tiene ofertas que apliquen", () => {
    const ofertas = calcularOfertas(4.5, 608_000, { region: "amazonia" }, SISTEMAS);
    expect(ofertas.every((o) => !o.aplica)).toBe(true);
    expect(ofertas[0].motivoNoAplica).toBe("Todavía no llega a tu región.");
    expect(elegirMejorOferta(ofertas)).toBeUndefined();
  });
});

const FRIO_SOLAR: CatalogoPanelSistema = {
  proveedor: "Frío Solar",
  estadoDatos: "referencial",
  departamentosConfirmados: ["La Guajira"],
  regiones: ["caribe"],
  planes: [
    { nombre: "Plan Básico", kwp: 4, precio: 18_500_000 },
    { nombre: "Plan Premium", kwp: 6, precio: 28_750_000 },
    { nombre: "Plan Empresarial", kwp: 10, precio: 45_200_000 },
  ],
  financiacion: null,
  pagoDescripcion: "A confirmar con el proveedor",
  simulacionPago: {
    tasaMensual: 0.01,
    plazoMeses: 36,
    opcionesCuotaInicialPct: [0, 0.2, 0.3, 0.4],
    fuente: "Supuesto del equipo",
  },
};

describe("simulación de pago de Frío Solar (36 meses, 1 % mensual)", () => {
  const casos = [
    { plan: "Básico", precio: 18_500_000, ahorro: 420_000, pct: 0, cuota: 614_464, flujo: -217_589 },
    { plan: "Básico", precio: 18_500_000, ahorro: 420_000, pct: 0.4, cuota: 368_678, flujo: 28_196 },
    { plan: "Premium", precio: 28_750_000, ahorro: 630_000, pct: 0.3, cuota: 668_437, flujo: -74_375 },
    { plan: "Empresarial", precio: 45_200_000, ahorro: 1_050_000, pct: 0.4, cuota: 900_772, flujo: 92_727 },
  ];
  for (const c of casos) {
    it(`${c.plan} con ${c.pct * 100} % de cuota inicial`, () => {
      const pago = simularPago(c.precio, c.ahorro, c.pct, 0.01, 36);
      expect(pago.cuotaMensual).toBeCloseTo(c.cuota, -1);
      expect(pago.flujoMensual).toBeCloseTo(c.flujo, -1);
    });
  }
});

describe("selección del plan (cobertura ≥ 80 % y uso ≥ 50 %)", () => {
  const planes = FRIO_SOLAR.planes!;
  // Ahorro de ≈ $105.000 por kWp necesario, como en los supuestos del equipo.
  const ahorroDe = (kwp: number) => kwp * 105_000;

  it.each([
    [2.0, "Plan Básico", undefined],
    [3.0, "Plan Básico", undefined],
    [4.3, "Plan Básico", "Plan Premium"],
    [4.5, "Plan Básico", "Plan Premium"],
    [5.0, "Plan Básico", "Plan Premium"],
    [5.5, "Plan Premium", undefined],
    [8.0, "Plan Empresarial", undefined],
    [12.0, "Plan Empresarial", undefined],
  ])("%s kWp → %s (cubre más: %s)", (kwp, recomendado, cubreMas) => {
    const r = elegirPlan(kwp, ahorroDe(kwp), planes);
    expect(r.plan?.plan.nombre).toBe(recomendado);
    expect(r.planCubreMas?.plan.nombre).toBe(cubreMas);
    expect(r.motivoNoAplica).toBeUndefined();
  });

  it("un plan más chico que lo necesario ahorra en proporción a lo que cubre", () => {
    const r = elegirPlan(5, 500_000, planes);
    expect(r.plan?.cobertura).toBeCloseTo(0.8, 6);
    expect(r.plan?.ahorroMensual).toBeCloseTo(400_000, 0);
    expect(r.planCubreMas?.ahorroMensual).toBe(500_000);
  });

  it("1,6 kWp no aplica: el plan más pequeño es de 4 kW", () => {
    const r = elegirPlan(1.6, ahorroDe(1.6), planes);
    expect(r.plan).toBeUndefined();
    expect(r.motivoNoAplica).toBe(
      "Su plan más pequeño es de 4 kW y tu sistema necesario sería de 1,6 kWp."
    );
  });

  it("14 kWp requiere un sistema a medida", () => {
    expect(elegirPlan(14, ahorroDe(14), planes).motivoNoAplica).toBe(
      "Tu consumo requiere un sistema a medida: cotiza directamente."
    );
  });
});

describe("proveedor real y de ejemplo", () => {
  const todos = [...SISTEMAS, FRIO_SOLAR];

  it("en La Guajira solo aparece Frío Solar, con el plan, su precio y la segunda opción", () => {
    const ofertas = calcularOfertas(4.5, 608_000, { region: "caribe", departamento: "La Guajira" }, todos);
    expect(ofertas.map((o) => o.proveedor)).toEqual(["Frío Solar"]);
    const [frio] = ofertas;
    expect(frio.aplica).toBe(true);
    expect(frio.plan?.nombre).toBe("Plan Básico");
    expect(frio.inversion).toBe(18_500_000);
    const ahorroBasico = 608_000 * (4 / 4.5);
    expect(frio.ahorroMensual).toBeCloseTo(ahorroBasico, 6);
    expect(frio.retornoMeses).toBeCloseTo(35.94846520019745, 6);
    expect(frio.financiacion).toBeUndefined();
    expect(frio.primerPago).toBeUndefined();
    expect(frio.simulacionPago?.opciones).toHaveLength(4);
    expect(frio.notaCobertura).toBeUndefined();

    expect(frio.cubreMas?.plan?.nombre).toBe("Plan Premium");
    expect(frio.cubreMas?.inversion).toBe(28_750_000);
    expect(frio.cubreMas?.ahorroMensual).toBe(608_000);
    expect(elegirMejorOferta(ofertas)?.plan?.nombre).toBe("Plan Básico");
  });

  it("si Frío Solar no aplica por tamaño, los de ejemplo siguen ocultos", () => {
    const ofertas = calcularOfertas(1.6, 200_000, { region: "caribe", departamento: "La Guajira" }, todos);
    expect(ofertas).toHaveLength(1);
    expect(ofertas[0].aplica).toBe(false);
    expect(ofertas[0].cubreZona).toBe(true);
    expect(ofertas[0].motivoNoAplica).toContain("Su plan más pequeño es de 4 kW");
    expect(elegirMejorOferta(ofertas)).toBeUndefined();
  });

  it("en el resto del Caribe aparece Frío Solar con la nota de cobertura", () => {
    const ofertas = calcularOfertas(4.5, 608_000, { region: "caribe", departamento: "Atlántico" }, todos);
    expect(ofertas.map((o) => o.proveedor)).toEqual(["Frío Solar"]);
    expect(ofertas[0].notaCobertura).toBe(
      "Atiende La Guajira. En el resto del Caribe, por confirmar con el proveedor."
    );
  });

  it("en la región Andina solo aparecen los de ejemplo", () => {
    const ofertas = calcularOfertas(4.5, 608_000, { region: "andina" }, todos);
    expect(ofertas.some((o) => o.proveedor === "Frío Solar")).toBe(false);
  });
});

const CATALOGO = (catalogoJson as CatalogoData).paneles;
const SUNVOLT = CATALOGO.find((s) => s.proveedor === "Sunvolt")!;
const ERCO = CATALOGO.find((s) => s.proveedor === "Erco Energía")!;

describe("Sunvolt: EPC y PPA (kWp = 4,5 y ahorro = $608.000)", () => {
  const [epc, ppa] = calcularOfertas(4.5, 608_000, { region: "andina" }, [SUNVOLT]);

  it("el catálogo coincide con la estimación de pricing.ts", () => {
    const [cEpc, cPpa] = SUNVOLT.ofertas!;
    expect(cEpc.tipo === "EPC" && cEpc.precioPorKwpCOP).toBe(SUNVOLT_ESTIMACION.precioEpcPorKwp);
    expect(cEpc.kwpMin).toBe(SUNVOLT_ESTIMACION.kwpMinEpc);
    expect(cPpa.tipo === "PPA" && cPpa.descuentoSobreRed).toBe(SUNVOLT_ESTIMACION.descuentoPpaSobreRed);
    expect(cPpa.kwpMin).toBe(SUNVOLT_ESTIMACION.kwpMinPpa);
    expect(SUNVOLT.fuente).toContain("2026-10-13");
  });

  it("dos tarjetas, una por oferta", () => {
    expect([epc.id, ppa.id]).toEqual(["Sunvolt:EPC", "Sunvolt:PPA"]);
    expect(epc.titulo).toBe("Sunvolt, sistema llave en mano (EPC)");
    expect(ppa.titulo).toBe("Sunvolt, sin inversión inicial (PPA)");
    expect(epc.etiqueta).toContain("No es una cotización de Sunvolt");
    expect(ppa.notaCobertura).toBe("Sunvolt indica cobertura nacional. Por confirmar en tu municipio.");
  });

  it("EPC: inversión de $27.000.000 con ±15 % y retorno ≈ 3,9 años", () => {
    expect(epc.aplica).toBe(true);
    expect(epc.inversion).toBe(27_000_000);
    expect(epc.inversionMin).toBeCloseTo(22_950_000, 0);
    expect(epc.inversionMax).toBeCloseTo(31_050_000, 0);
    expect(epc.retornoMeses).toBeCloseTo(47.388068532139755, 6);
    expect(epc.retornoMeses! / 12).toBeCloseTo(3.9, 1);
    expect(epc.financiacion).toBeUndefined();
  });

  it("PPA: paga ≈ $516.800, ahorra ≈ $91.200, sin inversión ni retorno", () => {
    expect(ppa.aplica).toBe(true);
    expect(ppa.ppa?.pagoMensual).toBeCloseTo(516_800, 0);
    expect(ppa.ahorroMensual).toBeCloseTo(91_200, 0);
    expect(ppa.inversion).toBe(0);
    expect(ppa.retornoMeses).toBeNull();
    expect(elegirMejorOferta([epc, ppa])?.id).toBe("Sunvolt:EPC");
  });

  it("EPC con 1,5 kWp y PPA con 2,5 kWp no aplican", () => {
    const [epcChico] = calcularOfertas(1.5, 200_000, { region: "andina" }, [SUNVOLT]);
    expect(epcChico.aplica).toBe(false);
    expect(epcChico.motivoNoAplica).toContain("Instala desde 2 kWp");
    const [, ppaChico] = calcularOfertas(2.5, 300_000, { region: "andina" }, [SUNVOLT]);
    expect(ppaChico.aplica).toBe(false);
    expect(ppaChico.motivoNoAplica).toContain("desde 3 kWp");
  });

  it("con Sunvolt en todo el país, los de ejemplo dejan de verse", () => {
    for (const region of ["andina", "pacifico", "orinoquia", "amazonia"] as const) {
      const ofertas = calcularOfertas(4.5, 608_000, { region }, [...SISTEMAS, SUNVOLT]);
      expect(ofertas.every((o) => o.estadoDatos !== "simulado")).toBe(true);
    }
  });
});

describe("Erco Energía (plan de referencia de ≈ 3,5 kWp)", () => {
  const ofertaErco = (kwp: number) =>
    calcularOfertas(kwp, kwp * 105_000, { region: "andina" }, [ERCO])[0];

  it.each([3.0, 4.3])("%s kWp aplica", (kwp) => {
    const o = ofertaErco(kwp);
    expect(o.aplica).toBe(true);
    expect(o.inversion).toBe(27_500_000);
    expect(o.inversionMin).toBe(25_000_000);
    expect(o.inversionMax).toBe(30_000_000);
    expect(o.requiereVisitaTecnica).toBe(true);
    expect(o.etiqueta).toBe("Precio de referencia de prensa, no es una cotización de Erco");
  });

  it.each([1.6, 6.0])("%s kWp no aplica: cotiza directamente", (kwp) => {
    const o = ofertaErco(kwp);
    expect(o.aplica).toBe(false);
    expect(o.motivoNoAplica).toBe(
      "Su sistema de referencia es de ≈ 3,5 kWp. Para tu consumo, cotiza directamente."
    );
  });

  it("la fuente cita El Colombiano con la fecha de consulta", () => {
    expect(ERCO.fuente).toContain("El Colombiano");
    expect(ERCO.fuente).toContain("2026-10-13");
  });
});

describe("catálogo completo", () => {
  it("en el Caribe se ven Frío Solar, Sunvolt (EPC y PPA) y Erco, sin los de ejemplo", () => {
    const ofertas = calcularOfertas(4.3, 450_000, { region: "caribe", departamento: "La Guajira" }, CATALOGO);
    expect(ofertas.map((o) => o.id)).toEqual(["Frío Solar", "Sunvolt:EPC", "Sunvolt:PPA", "Erco Energía"]);
  });

  it("en las demás regiones, Sunvolt y Erco", () => {
    const ofertas = calcularOfertas(4.3, 450_000, { region: "pacifico" }, CATALOGO);
    expect(ofertas.map((o) => o.id)).toEqual(["Sunvolt:EPC", "Sunvolt:PPA", "Erco Energía"]);
  });
});
