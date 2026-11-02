import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

function request(extra: Record<string, string> = {}) {
  const body = new FormData();
  for (const [k, v] of Object.entries({ departamento: "Vichada", consumoMensualKwh: "600", conexion: "sin_red", ...extra })) body.set(k, v);
  return new NextRequest("http://localhost/api/analizar", { method: "POST", body });
}

describe("POST /api/analizar", () => {
  it("valida el presupuesto tributario contra la inversión y devuelve un error de entrada", async () => {
    const response = await POST(request({ conexion: "estable", "finanzas.simularDeduccion": "1", "finanzas.baseElegibleCOP": "100000000", "finanzas.tarifaRentaPct": "35", "finanzas.rentaLiquidaAnualCOP": "20000000" }));
    expect(response.status).toBe(400);
    expect((await response.json()).error).toContain("base elegible");
  });
  it("conserva los costos de batería, reposición y mantenimiento en el resultado de la API", async () => {
    const response = await POST(request({ conexion: "intermitente", potenciaCriticaW: "500", horasAutonomia: "4", "finanzas.inversionTotalCOP": "28000000", "finanzas.mantenimientoAnualCOP": "900000", "finanzas.reposicionBateriaCOP": "6000000", "finanzas.aniosReposicionBateria": "8" }));
    const f = (await response.json()).resultado.alternativas[0].finanzas;
    expect(response.status).toBe(200); expect(f.inversion).toBe(28000000); expect(f.mantenimientoAnual).toBe(900000);
    expect(f.proyeccion.rows[8].reposiciones).toBe(6000000); expect(f.proyeccion.rows[16].reposiciones).toBe(6000000);
  });
  it("sin red devuelve orientación y proveedores sin inventar retorno ni precio de batería", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    const { resultado } = await response.json();
    expect(resultado.energia.solucion).toBe("aislado");
    expect(resultado.energia.bateriaNominalKwh).toBeUndefined();
    expect(resultado.proveedores[0].id).toBe("soluna");
    expect(resultado.alternativas[0].retornoMeses).toBeNull();
  });
  it("valida la potencia de respaldo y conserva el municipio", async () => {
    const response = await POST(request({ potenciaCriticaW: "500", horasAutonomia: "4", municipio: "Puerto Carreño" }));
    const { resultado } = await response.json();
    expect(response.status).toBe(200);
    expect(resultado.energia.bateriaNominalKwh).toBeCloseTo(2.77777778);
    expect(resultado.ubicacion.municipio).toBe("Puerto Carreño");
  });
  it("un costo sin kWh en un negocio sin red recibe 400", async () => {
    const response = await POST(request({ consumoMensualKwh: "", valorPagadoMensual: "300000" }));
    expect(response.status).toBe(400);
  });
  it("una conexión desconocida no causa un error interno", async () => {
    const response = await POST(request({ conexion: "inventada" }));
    expect(response.status).toBe(400);
  });
  it("con red estable usa referencia genérica y no publica los precios históricos de marca", async () => {
    const response = await POST(request({ conexion: "estable" }));
    const { resultado } = await response.json();
    expect(response.status).toBe(200);
    expect(resultado.energia.requiereEstudio).toBe(false);
    expect(resultado.alternativas[0].fuentePrecio).toBe("estimado");
    expect(resultado.alternativas[0].ofertas).toEqual([]);
    expect(resultado.proveedores.length).toBeGreaterThan(0);
  });
});
