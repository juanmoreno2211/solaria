import { NextRequest, NextResponse } from "next/server";
import { normalizarCelular, validarPedidoContacto, type PedidoContactoInput } from "@/lib/cotizacion";
import { regionForDepartment } from "@/lib/geo/regions";
import { enviarAHoja, variablesHojaFaltantes } from "@/lib/sheets";

export const runtime = "nodejs";

function texto(valor: unknown, max = 120): string {
  return typeof valor === "string" ? valor.trim().slice(0, max) : "";
}

function numero(valor: unknown): number | null {
  return typeof valor === "number" && Number.isFinite(valor) ? valor : null;
}

/**
 * "Quiero que me contacten": guarda nombre y celular en la hoja "solicitudes"
 * para que el equipo de SolarIA le escriba. Usa las mismas columnas que
 * /api/cotizaciones y agrega al final el canal y la referencia.
 */
export async function POST(req: NextRequest) {
  let body: PedidoContactoInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const nombre = texto(body?.nombre, 100);
  const celularCrudo = texto(body?.celular, 30);
  const errores = validarPedidoContacto({ nombre, celular: celularCrudo, consentimiento: body?.consentimiento === true });
  if (Object.keys(errores).length > 0) {
    return NextResponse.json({ error: "Revisa los datos del formulario.", errores }, { status: 400 });
  }

  // En producción una solicitud sin dónde guardarse se perdería: mejor avisar.
  const faltantes = variablesHojaFaltantes();
  if (process.env.NODE_ENV === "production" && faltantes.length > 0) {
    console.error(`[solicitar-contacto] falta configurar: ${faltantes.join(", ")}`);
    return NextResponse.json({ error: "No pudimos guardar tu solicitud." }, { status: 500 });
  }

  const negocio = body.negocio ?? {};
  const estimado = body.estimado ?? {};
  const departamento = texto(negocio.departamento, 40);
  const id = crypto.randomUUID();

  // Mismo orden de columnas que /api/cotizaciones; las dos últimas son nuevas.
  const ok = await enviarAHoja("solicitudes", [
    id,
    new Date().toISOString(),
    texto(body.sessionId, 64),
    texto(body.proveedor, 80) || "Orientación SolarIA",
    "",
    nombre,
    normalizarCelular(celularCrudo),
    texto(body.municipio, 100),
    // Columna "consentimiento": aquí es si autorizó compartir con el proveedor.
    body.compartirConProveedor === true,
    texto(negocio.tipo, 40),
    regionForDepartment(departamento) ?? "",
    texto(negocio.horario, 30),
    "",
    texto(negocio.conexion, 30),
    "",
    numero(estimado.consumoKwh),
    numero(estimado.valorFactura),
    numero(estimado.kwp),
    numero(estimado.ahorroMensual),
    numero(estimado.inversion),
    numero(estimado.retornoMeses),
    "nueva",
    departamento,
    texto(body.plan, 60),
    texto(body.oferta, 20),
    "quiere_que_lo_contacten",
    texto(body.ref, 20),
  ]);

  if (!ok) {
    console.error("[solicitar-contacto] no se pudo guardar la solicitud", id);
    return NextResponse.json({ error: "No pudimos enviar tu solicitud. Intenta de nuevo o escríbenos por WhatsApp." }, { status: 502 });
  }
  return NextResponse.json({ id }, { status: 201 });
}
