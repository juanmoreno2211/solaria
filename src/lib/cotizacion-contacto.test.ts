import { describe, expect, it } from "vitest";
import { armarMensajeContacto, referenciaParaContacto, type DatosCotizacion, type DestinoCotizacion } from "./cotizacion-contacto";
import { calcularAhorro } from "./savings/calculate";
import { cifrasPrincipales } from "./savings/cifras";
import { calcularOfertas } from "./savings/ofertas";
import catalogoJson from "./catalog/data/catalogo.json";
import type { CatalogoData } from "./catalog/types";
import type { AnalisisInput } from "./savings/types";

function caso(conexion: NonNullable<AnalisisInput["negocio"]["conexion"]> = "sin_red") {
  const input: AnalisisInput = { recibo: { fuente: "manual", consumoMensualKwh: 600, valorPagadoMensual: null }, negocio: { tipoNegocio: "tienda", region: "orinoquia", departamento: "Vichada", municipio: "Puerto Carreño", cargasCriticas: [], horario: "dia", conexion, potenciaCriticaW: 500, horasAutonomia: 4 } };
  const r = calcularAhorro(input);
  const datos: DatosCotizacion = { departamento: "Vichada", municipio: "Puerto Carreño", conexion, consumoKwh: 600, valorFactura: r.valorPagadoMensual, valorFacturaEstimado: r.valorEstimado, kwp: r.energia!.potenciaSolarBaseKwp, energia: r.energia, referenciaEconomica: cifrasPrincipales(r.alternativas[0]) };
  return { r, datos };
}

describe("contacto con SolarIA sin exigir precio comercial", () => {
  it("un proveedor del directorio pasa al mensaje con los datos del negocio", () => {
    const {r,datos} = caso();
    const destino: DestinoCotizacion = { tipo: "consulta", proveedor: r.proveedores![0] };
    const mensaje = armarMensajeContacto(destino, datos, false, "SIA-TEST");
    expect(mensaje).toContain("Soluna Energía");
    expect(mensaje).toContain("Puerto Carreño, Vichada");
    expect(mensaje).toContain("600 kWh");
    expect(mensaje).toContain("SIA-TEST");
  });
  it("un caso aislado no convierte un presupuesto pendiente en inversión o retorno ficticios", () => {
    const {r,datos} = caso();
    const destino: DestinoCotizacion = { tipo: "consulta", proveedor: r.proveedores![0] };
    expect(referenciaParaContacto(destino, datos)).toBeUndefined();
    const mensaje = armarMensajeContacto(destino, datos, false, "SIA-TEST");
    expect(mensaje).not.toMatch(/inversión de|Retorno de referencia|\$\s*0/);
  });
  it("con red conserva el escenario genérico sin atribuir su precio al proveedor", () => {
    const {r,datos} = caso("estable");
    const mensaje = armarMensajeContacto({ tipo: "consulta", proveedor: r.proveedores![0] }, datos, false, "SIA-TEST");
    expect(mensaje).toContain("Escenario de referencia de SolarIA");
    expect(mensaje).toContain("No es una cotización del proveedor");
    expect(mensaje).toContain("Valor mensual estimado");
  });
  it("es posible contactar a SolarIA sin autorizar envío a terceros", () => {
    const {datos} = caso();
    const mensaje = armarMensajeContacto({ tipo: "consulta" }, datos, false, "SIA-TEST");
    expect(mensaje).toContain("solicito atención de SolarIA");
    expect(mensaje).not.toContain("Autorizo que SolarIA comparta");
  });
  it("la autorización elegida se limita al proveedor seleccionado", () => {
    const {r,datos} = caso();
    const mensaje = armarMensajeContacto({ tipo: "consulta", proveedor: r.proveedores![0] }, datos, true, "SIA-TEST");
    expect(mensaje).toContain("Autorizo que SolarIA comparta estos datos y mi número con Soluna Energía");
    expect(mensaje).not.toContain("con Erco");
  });
  it("una conexión por confirmar conserva una ruta de orientación sin dimensionamiento comercial", () => {
    const {datos} = caso("no_se");
    const mensaje = armarMensajeContacto({ tipo: "consulta" }, datos, false, "SIA-TEST");
    expect(mensaje).toContain("ayuda para elegir");
    expect(mensaje).not.toContain("Base solar orientativa");
    expect(mensaje).not.toContain("Escenario de referencia");
  });
  it("la estimación de batería viaja como orientación pendiente de validación", () => {
    const {datos} = caso();
    const mensaje = armarMensajeContacto({ tipo: "consulta" }, datos, false, "SIA-TEST");
    expect(mensaje).toContain("Batería orientativa");
    expect(mensaje).toContain("500 W medios durante 4 h");
    expect(mensaje).toContain("pendiente de validación");
  });
  it("conserva la ruta previa de ofertas con precio y plan", () => {
    const {datos} = caso("estable");
    const [oferta] = calcularOfertas(4, 400000, { region: "caribe" }, [(catalogoJson as CatalogoData).paneles[0]]);
    const mensaje = armarMensajeContacto({ tipo: "oferta", oferta }, datos, true, "SIA-TEST");
    expect(mensaje).toContain(oferta.proveedor);
    expect(mensaje).toContain("Escenario de referencia de SolarIA");
    expect(mensaje).toContain("con un instalador");
  });
});
