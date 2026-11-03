import { describe, expect, it } from "vitest";
import { presupuestoSolar, REFERENCIAS_COSTOS } from "@/lib/config/costs";
import { calcularAhorro } from "./calculate";
import { cifrasPrincipales, proyeccionDeCifras } from "./cifras";
import { proyectar20Anios } from "./projection";
import { validarAnalisis } from "./validation";
import { armarMensajeContacto, referenciaParaContacto } from "@/lib/cotizacion-contacto";
import type { AnalisisInput } from "./types";

function entrada(): AnalisisInput { return { recibo: { fuente: "manual", consumoMensualKwh: 600, valorPagadoMensual: 500000 }, negocio: { tipoNegocio: "tienda", region: "orinoquia", departamento: "Vichada", cargasCriticas: [], horario: "dia", conexion: "estable" } }; }
function financiero(i = entrada()) { return calcularAhorro(i).alternativas[0].finanzas!; }
function respaldo(): AnalisisInput { const i = entrada(); Object.assign(i.negocio, { conexion: "intermitente", potenciaCriticaW: 500, horasAutonomia: 4 }); return i; }
function formulario(extra: Record<string, string>) { const f = new FormData(); for (const [k, v] of Object.entries({ departamento: "Vichada", consumoMensualKwh: "600", conexion: "estable", ...extra })) f.set(k, v); return f; }

describe("presupuesto según tamaño y alcance", () => {
  it.each([[3,15000000],[10,42500000],[20,77000000],[60,204000000]])("referencia de %s kWp sin aplicar tarifa industrial a microsistemas", (kwp, costo) => expect(presupuestoSolar(kwp).base).toBe(costo));
  it("no abarata el total al cruzar una banda de potencia", () => {
    let anterior = 0;
    for (let kwp = .1; kwp <= 500; kwp += .1) { const p = presupuestoSolar(kwp); expect(p.minimo).toBeLessThan(p.maximo); expect(p.base).toBeGreaterThan(anterior); anterior = p.base; }
  });
  it("redondea la batería a módulos nominales, no a kWh útiles ni a una fracción de equipo", () => {
    const f = financiero(respaldo());
    expect(f.modulosBateria).toBe(1); expect(f.capacidadPresupuestadaKwh).toBe(5.12);
    expect(f.bateria).toBe(4_868_231);
    expect(f.inversion).toBeCloseTo(f.solar * 1.2 + 4_868_231);
    expect(f.ahorroMensualBase).toBe(400000); // No se monetizan cortes o ventas evitadas.
  });
  it("una cotización instalada sustituye el presupuesto completo una sola vez", () => {
    const i = respaldo(); i.negocio.finanzas = { inversionTotalCOP: 28000000, costosAdicionalesCOP: 5000000 };
    const f = financiero(i); expect(f.inversion).toBe(28000000); expect(f.inversionMin).toBe(28000000);
    expect(f.proyeccion!.rows[0].netoAcumulado).toBe(-28000000);
  });
  it("el mantenimiento cotizado sustituye el porcentaje y no lo duplica con la batería", () => {
    const i = respaldo(); i.negocio.finanzas = { mantenimientoAnualCOP: 900000 };
    const f = financiero(i); expect(f.mantenimientoAnual).toBe(900000); expect(f.proyeccion!.rows[1].mantenimiento).toBe(900000);
  });
  it("sin las cargas ni un costo completo de reposición no inventa un presupuesto híbrido completo", () => {
    const i = entrada(); i.negocio.conexion = "intermitente";
    const f = financiero(i); expect(f.estado).toBe("incompleto"); expect(f.inversion).toBeNull(); expect(f.proyeccion).toBeUndefined();
  });
  it("admite una cotización completa y reposición cotizada sin inferir la capacidad de la batería", () => {
    const i = entrada(); i.negocio.conexion = "intermitente"; i.negocio.finanzas = { inversionTotalCOP: 30000000, reposicionBateriaCOP: 10000000 };
    const f = financiero(i); expect(f.proyeccion).toBeDefined(); expect(f.capacidadPresupuestadaKwh).toBe(0); expect(f.reposicionBateriaCOP).toBe(10000000);
  });
  it("no considera conocidos el transporte ni la logística por estar en el mismo departamento", () => {
    const i = respaldo(); i.negocio.zona = "apartada";
    expect(financiero(i).supuestos.join(" ")).toContain("no están incluidos");
  });
});

describe("proyección completa y recuperación", () => {
  it("registra una reposición al año 10, sin comprar otra batería al terminar el horizonte", () => {
    const f = financiero(respaldo());
    expect(f.proyeccion!.rows[10].reposiciones).toBeCloseTo(5_355_054.1);
    expect(f.proyeccion!.rows[20].reposiciones).toBe(0);
    expect(f.proyeccion!.rows.filter((r) => r.reposiciones > 0).map((r) => r.anio)).toEqual([10]);
  });
  it("un intervalo de ocho años produce dos reposiciones y un presupuesto de montaje editable", () => {
    const i = respaldo(); i.negocio.finanzas = { aniosReposicionBateria: 8, reposicionBateriaCOP: 6000000 };
    expect(financiero(i).proyeccion!.rows.filter((r) => r.reposiciones > 0).map((r) => [r.anio,r.reposiciones])).toEqual([[8,6000000],[16,6000000]]);
  });
  it("agrega la reposición cotizada de inversor sin duplicar la inversión inicial", () => {
    const i = respaldo(); i.negocio.finanzas = { reposicionInversorCOP: 3000000, aniosReposicionInversor: 10 };
    const f = financiero(i); expect(f.proyeccion!.rows[10].reposiciones).toBeCloseTo(8_355_054.1);
    expect(f.proyeccion!.rows[0].netoAcumulado).toBe(-f.inversion!);
  });
  it("la degradación se aplica desde el segundo año sin añadir inflación a los pesos reales", () => {
    const p = proyectar20Anios({ inversion: 10000, ahorroMensual: 100, mantenimientoAnualCOP: 0 });
    expect(p.rows[1].ahorroBruto).toBe(1200); expect(p.rows[2].ahorroBruto).toBe(1194);
  });
  it("no anuncia recuperación definitiva antes de una reposición que vuelve negativo el saldo", () => {
    const p = proyectar20Anios({ inversion: 1000, ahorroMensual: 100, mantenimientoAnualCOP: 0, degradacionPct: 0, reposiciones: [{ anio:2, costo:5000 }] });
    expect(p.rows[1].netoAcumulado).toBe(200); expect(p.rows[2].netoAcumulado).toBe(-3600); expect(p.retornoAnios).toBe(5);
  });
  it("tarjeta, proyección y datos de contacto usan las mismas cifras", () => {
    const i = respaldo(); const r = calcularAhorro(i); const c = cifrasPrincipales(r.alternativas[0]); const p = proyeccionDeCifras(c);
    expect(c.inversion).toBe(r.alternativas[0].finanzas!.inversion);
    expect(c.retornoMeses).toBe(p.retornoAnios! * 12);
    const datos = { departamento:"Vichada", consumoKwh:600, valorFactura:500000, kwp:4, energia:r.energia, referenciaEconomica:c };
    const destino = { tipo:"consulta" as const };
    expect(referenciaParaContacto(destino,datos)).toBe(c);
    expect(armarMensajeContacto(destino,datos,false,"TEST")).toContain("Reposición presupuestada de baterías");
  });
});

describe("sin red no usa una factura urbana ficticia", () => {
  it("muestra presupuesto de equipos pero no ahorro si falta gasto sustituible", () => {
    const i = respaldo(); i.negocio.conexion = "sin_red";
    const r = calcularAhorro(i); expect(r.tarifaEstimadaKwh).toBe(0);
    const f = r.alternativas[0].finanzas!; expect(f.inversion).toBeGreaterThan(0); expect(f.ahorroMensualBase).toBeNull(); expect(f.proyeccion).toBeUndefined();
  });
  it("compara el porcentaje indicado del gasto actual, no kWh por tarifa urbana", () => {
    const i = respaldo(); i.negocio.conexion = "sin_red"; i.negocio.finanzas = { costoEnergiaActualCOP:1000000, porcentajeCostoEvitable:70 };
    const r = calcularAhorro(i); const f = r.alternativas[0].finanzas!; expect(f.ahorroMensualBase).toBe(700000); expect(f.proyeccion!.rows[1].ahorroBruto).toBe(8400000); expect(r.alternativas[0].ahorroPorcentual).toBe(70);
  });
});

describe("deducción de renta condicionada, no descuento del precio", () => {
  const base = { inversion:100000000, ahorroMensual:0, mantenimientoAnualCOP:0, degradacionPct:0 };
  it("50 % deducible a tarifa de 35 % da 17,5 millones, no 50 millones de devolución", () => {
    const p = proyectar20Anios({ ...base, deduccionRenta:{baseElegibleCOP:100000000,tarifaRentaPct:35,rentaLiquidaAnualCOP:20000000} });
    expect(p.rows[1].deduccionRenta).toBe(10000000); expect(p.rows[5].deduccionRenta).toBe(10000000); expect(p.rows[6].deduccionRenta).toBe(0);
    expect(p.ahorroTributarioTotal).toBe(17500000); expect(p.rows[0].netoAcumulado).toBe(-100000000);
  });
  it("respeta el límite de renta líquida y los quince años, sin usar el excedente en el año 16", () => {
    const p = proyectar20Anios({ ...base, deduccionRenta:{baseElegibleCOP:100000000,tarifaRentaPct:35,rentaLiquidaAnualCOP:2000000} });
    expect(p.ahorroTributarioTotal).toBe(5250000); expect(p.deduccionNoUtilizada).toBe(35000000); expect(p.rows[16].ahorroTributario).toBe(0);
  });
  it("sin renta líquida no hay ahorro de renta", () => {
    const p = proyectar20Anios({ ...base, deduccionRenta:{baseElegibleCOP:100000000,tarifaRentaPct:35,rentaLiquidaAnualCOP:0} });
    expect(p.ahorroTributarioTotal).toBe(0); expect(p.deduccionNoUtilizada).toBe(50000000);
  });
  it("estar constituido no activa un beneficio", () => {
    const i = entrada(); i.negocio.legalmenteConstituido = "si"; const f = financiero(i);
    expect(f.simulacionTributaria).toBe(false); expect(f.proyeccion!.ahorroTributarioTotal).toBe(0);
  });
  it("la simulación explícita mejora el saldo pero no aumenta el ahorro energético mensual", () => {
    const i = entrada(); i.negocio.finanzas = { inversionTotalCOP:100000000,simularDeduccion:true,baseElegibleCOP:100000000,tarifaRentaPct:35,rentaLiquidaAnualCOP:20000000 };
    const f = financiero(i); expect(f.ahorroMensualBase).toBe(400000); expect(f.inversion).toBe(100000000); expect(f.proyeccion!.ahorroTributarioTotal).toBe(17500000);
  });
});

describe("validación financiera en API y función pura", () => {
  it.each([{ 'finanzas.aniosReposicionBateria':'0' },{ 'finanzas.aniosReposicionBateria':'8.5' },{ 'finanzas.porcentajeCostoEvitable':'101' },{ 'finanzas.inversionTotalCOP':'-1' },{ 'finanzas.reposicionBateriaCOP':'Infinity' },{ 'finanzas.simularDeduccion':'1' },{ 'finanzas.tarifaRentaPct':'NaN' }] as Record<string, string>[])("rechaza datos inválidos %j", (f) => expect(validarAnalisis(formulario(f)).ok).toBe(false));
  it("acepta mantenimiento y renta líquida cero cuando se ingresan expresamente", () => expect(validarAnalisis(formulario({'finanzas.mantenimientoAnualCOP':'0','finanzas.simularDeduccion':'1','finanzas.baseElegibleCOP':'100','finanzas.tarifaRentaPct':'35','finanzas.rentaLiquidaAnualCOP':'0'})).ok).toBe(true));
  it("impide un intervalo de reposición cero al llamar la función sin pasar por la API", () => {
    const i = respaldo(); i.negocio.finanzas = {aniosReposicionBateria:0}; expect(()=>financiero(i)).toThrow(RangeError);
  });
  it("la base elegible no puede exceder el presupuesto", () => {
    const i=entrada();i.negocio.finanzas={simularDeduccion:true,baseElegibleCOP:100000000,tarifaRentaPct:35,rentaLiquidaAnualCOP:100000000};expect(()=>financiero(i)).toThrow("base elegible");
  });
});
