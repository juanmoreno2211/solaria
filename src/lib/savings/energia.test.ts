import { describe, expect, it } from "vitest";
import { calcularAhorro } from "./calculate";
import { cifrasPrincipales } from "./cifras";
import { buscarProveedores, DIRECTORIO } from "@/lib/catalog/proveedores";
import { calcularOfertas } from "./ofertas";
import { orientarEnergia } from "./energia";
import { validarAnalisis } from "./validation";
import type { AnalisisInput } from "./types";

function entrada(): AnalisisInput {
  return { recibo: { fuente: "manual", consumoMensualKwh: 600, valorPagadoMensual: 500000 }, negocio: { tipoNegocio: "tienda", region: "orinoquia", departamento: "Vichada", cargasCriticas: ["neveras"], horario: "dia", conexion: "estable" } };
}
function form(extra: Record<string, string> = {}) {
  const f = new FormData();
  for (const [k, v] of Object.entries({ departamento: "Vichada", consumoMensualKwh: "600", conexion: "sin_red", ...extra })) f.set(k, v);
  return f;
}

describe("solución según la conexión real", () => {
  it("no clasifica un departamento completo como ZNI", () => {
    const i = entrada();
    i.negocio.zona = "apartada";
    const r = calcularAhorro(i);
    expect(r.energia?.solucion).toBe("conectado");
    expect(r.energia?.requiereEstudio).toBe(false);
  });
  it("sin red dimensiona toda la demanda y omite ahorro urbano y retorno", () => {
    const i = entrada(); i.negocio.conexion = "sin_red";
    const r = calcularAhorro(i);
    expect(r.energia?.solucion).toBe("aislado");
    expect(r.energia?.potenciaSolarBaseKwp).toBeCloseTo(20 / (r.ubicacion.hsp * .78));
    expect(r.valorPagadoMensual).toBe(0);
    expect(r.tarifaEstimadaKwh).toBe(0);
    expect(r.alternativas[0].ahorroMensualEstimado).toBe(0);
    expect(r.alternativas[0].retornoMeses).toBeNull();
    expect(r.alternativas[0].ofertas).toEqual([]);
  });
  it("los cortes llevan a híbrido aunque el consumo sea pequeño", () => {
    const i = entrada(); i.negocio.conexion = "intermitente"; i.recibo.consumoMensualKwh = 50;
    const r = calcularAhorro(i);
    expect(r.energia?.solucion).toBe("hibrido");
    expect(r.veredicto).toBe("comparar");
    expect(r.motivoVeredicto).not.toContain("consumo sube");
  });
  it("no calcula baterías sin conocer las cargas", () => {
    const i = entrada(); i.negocio.conexion = "intermitente";
    expect(calcularAhorro(i).energia?.bateriaNominalKwh).toBeUndefined();
  });
  it("500 W medios durante 4 horas requieren 2 kWh útiles y 2,78 kWh nominales bajo los supuestos", () => {
    const i = entrada(); Object.assign(i.negocio, { conexion: "intermitente", potenciaCriticaW: 500, horasAutonomia: 4 });
    const e = calcularAhorro(i).energia!;
    expect(e.energiaRespaldoKwh).toBe(2);
    expect(e.bateriaNominalKwh).toBeCloseTo(2 / (.8 * .9));
    expect(e.advertencias.join(" ")).toContain("solo corresponde a las cargas");
  });
  it("no infiere respaldo a partir de bajones de tensión únicamente", () => {
    const i = entrada(); delete i.negocio.conexion; i.negocio.fallaLuz = "bajones";
    const e = orientarEnergia(i, 600, 5);
    expect(e.solucion).toBe("conectado");
    expect(e.advertencias.join(" ")).toContain("protecciones");
  });
  it("conexión desconocida no recomienda instaladores como compatibles", () => {
    const i = entrada(); i.negocio.conexion = "no_se";
    const r = calcularAhorro(i);
    expect(r.energia?.requiereEstudio).toBe(true);
    expect(r.proveedores).toEqual([]);
  });
  it("sin red, un monto sin consumo no se convierte con la tarifa urbana", () => {
    const i = entrada(); i.negocio.conexion = "sin_red"; i.recibo.consumoMensualKwh = null;
    expect(() => calcularAhorro(i)).toThrow("consumo mensual estimado");
  });
  it("la inversión genérica y el retorno usan una única base sin redondear la potencia", () => {
    const r = calcularAhorro(entrada());
    const p = r.alternativas[0];
    const c = cifrasPrincipales(p);
    expect(c.inversion).toBeCloseTo(20_590_107.233828057, 5);
    expect(c.retornoMeses).toBeCloseTo(p.retornoMeses!, 0);
  });
});

describe("directorio con alcance y evidencia", () => {
  it("tiene nueve empresas, fuentes y fecha por referencia", () => {
    expect(DIRECTORIO).toHaveLength(9);
    expect(new Set(DIRECTORIO.map((p) => p.id)).size).toBe(9);
    for (const p of DIRECTORIO) {
      expect(p.fuentes.length).toBeGreaterThan(0);
      expect(p.url).toMatch(/^https:\/\//);
      expect(p.fuentes.every((f) => f.url.startsWith("https://") && f.consultadoEl === "2026-11-01")).toBe(true);
    }
  });
  it("prioriza Soluna en Vichada para un sistema aislado", () => {
    const r = buscarProveedores({ departamento: "Vichada", solucion: "aislado", consumoMensualKwh: 600 });
    expect(r[0].id).toBe("soluna");
    expect(r[0].motivo).toContain("por confirmar");
  });
  it("no extiende el servicio de Soluna a toda la Orinoquía", () => {
    const r = buscarProveedores({ departamento: "Meta", solucion: "aislado", consumoMensualKwh: 600 });
    expect(r.some((p) => p.id === "soluna")).toBe(false);
  });
  it("no recomienda ofertas solo conectadas para un negocio sin red", () => {
    const r = buscarProveedores({ departamento: "Amazonas", solucion: "aislado", consumoMensualKwh: 1000 });
    expect(r.some((p) => ["sunvolt", "celsia"].includes(p.id))).toBe(false);
  });
  it("respeta el umbral público de Celsia y no impone un mínimo inventado a otros", () => {
    const buscar = (consumoMensualKwh: number) => buscarProveedores({ departamento: "Antioquia", solucion: "conectado", consumoMensualKwh });
    expect(buscar(800).some((p) => p.id === "celsia")).toBe(false);
    expect(buscar(801).some((p) => p.id === "celsia")).toBe(true);
  });
  it("HG aparece para proyectos agrupados, no como oferta directa a una tienda", () => {
    const perfil = { departamento: "Chocó", solucion: "aislado" as const, consumoMensualKwh: 600 };
    expect(buscarProveedores(perfil).some((p) => p.id === "hg-ingenieria")).toBe(false);
    expect(buscarProveedores(perfil, undefined, true).some((p) => p.id === "hg-ingenieria")).toBe(true);
  });
  it("no publica por defecto precios internos ni proveedores ficticios", () => {
    expect(calcularOfertas(4, 500000, { region: "caribe", departamento: "La Guajira" })).toEqual([]);
  });
});

describe("validación de entradas rurales", () => {
  it("permite analizar sin factura cuando hay consumo estimado", () => expect(validarAnalisis(form()).ok).toBe(true));
  it("sin red exige kWh aunque exista un monto", () => expect(validarAnalisis(form({ consumoMensualKwh: "", valorPagadoMensual: "300000" })).ok).toBe(false));
  it.each(["NaN", "Infinity", "-2", "0"])("rechaza potencia inválida %s", (v) => expect(validarAnalisis(form({ potenciaCriticaW: v, horasAutonomia: "4" })).ok).toBe(false));
  it("exige ambos campos de batería", () => expect(validarAnalisis(form({ potenciaCriticaW: "500" })).ok).toBe(false));
  it("rechaza horas fuera del alcance del predimensionamiento", () => expect(validarAnalisis(form({ potenciaCriticaW: "500", horasAutonomia: "169" })).ok).toBe(false));
  it.each([{ conexion: "inventada" }, { zona: "inventada" }, { horario: "inventado" }, { departamento: "toString" }] as Record<string, string>[])("rechaza enums y ubicación inválidos %j", (v) => expect(validarAnalisis(form(v)).ok).toBe(false));
});
