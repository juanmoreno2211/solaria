import { NextRequest, NextResponse } from "next/server";
import { normalizarCelular, validarPedidoContacto, type PedidoContactoInput } from "@/lib/cotizacion";
import { regionForDepartment } from "@/lib/geo/regions";
import { enviarAHoja, variablesHojaFaltantes } from "@/lib/sheets";
import { createClient } from "@/lib/supabase/server";
import { guardarEnDestinos } from "@/lib/destinos";

export const runtime = "nodejs";

function texto(valor: unknown, max = 120): string {
  return typeof valor === "string" ? valor.trim().slice(0, max) : "";
}

function numero(valor: unknown): number | null {
  return typeof valor === "number" && Number.isFinite(valor) ? valor : null;
}

/**
 * "Quiero que me contacten": guarda nombre y celular en Supabase
 * (solicitudes_contacto) y en la hoja "solicitudes" para que el equipo de
 * SolarIA le escriba. En la hoja usa las mismas columnas que /api/cotizaciones
 * y agrega al final el canal y la referencia.
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

  const negocio = body.negocio ?? {};
  const estimado = body.estimado ?? {};
  const departamento = texto(negocio.departamento, 40);
  const id = crypto.randomUUID();

  const celular = normalizarCelular(celularCrudo)!;
  const municipio = texto(body.municipio, 100);
  const proveedor = texto(body.proveedor, 80) || "Orientación SolarIA";

  // Mismo orden de columnas que /api/cotizaciones; las dos últimas son nuevas.
  const fila = [
    id,
    new Date().toISOString(),
    texto(body.sessionId, 64),
    proveedor,
    "",
    nombre,
    celular,
    municipio,
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
  ];

  const supabase = await createClient();
  const { ok, fallaron } = await guardarEnDestinos({
    // La función valida e inserta; user_id sale de la sesión si la hay.
    supabase: async () => {
      const { error } = await supabase.rpc("crear_solicitud_contacto", {
        p: {
          session_id: texto(body.sessionId, 64),
          ref: texto(body.ref, 20),
          proveedor,
          plan: texto(body.plan, 60) || null,
          oferta: texto(body.oferta, 20) || null,
          nombre,
          celular,
          municipio: municipio || null,
          consentimiento: true,
          compartir_con_proveedor: body.compartirConProveedor === true,
          negocio: { tipo: texto(negocio.tipo, 40), departamento, horario: texto(negocio.horario, 30), conexion: texto(negocio.conexion, 30) },
          estimado: {
            consumoKwh: numero(estimado.consumoKwh),
            valorFactura: numero(estimado.valorFactura),
            kwp: numero(estimado.kwp),
            ahorroMensual: numero(estimado.ahorroMensual),
            inversion: numero(estimado.inversion),
            retornoMeses: numero(estimado.retornoMeses),
          },
        },
      });
      if (error) console.error("[solicitar-contacto] Supabase:", error.message);
      return !error;
    },
    // En producción sin webhook, enviarAHoja no guarda nada: cuenta como falla.
    hoja: async () => (process.env.NODE_ENV === "production" && variablesHojaFaltantes().length > 0 ? false : enviarAHoja("solicitudes", fila)),
  });

  if (fallaron.length) console.error(`[solicitar-contacto] no se guardó en: ${fallaron.join(", ")}`, id);
  if (!ok) {
    return NextResponse.json({ error: "No pudimos enviar tu solicitud. Intenta de nuevo o escríbenos por WhatsApp." }, { status: 502 });
  }
  return NextResponse.json({ id }, { status: 201 });
}
