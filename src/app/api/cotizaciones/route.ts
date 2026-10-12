import { NextRequest, NextResponse } from "next/server";
import catalogoJson from "@/lib/catalog/data/catalogo.json";
import type { CatalogoData } from "@/lib/catalog/types";
import { validarSolicitante, type SolicitudCotizacionInput } from "@/lib/cotizacion";
import { enviarAHoja, variablesHojaFaltantes } from "@/lib/sheets";

export const runtime = "nodejs";

const catalogo = catalogoJson as CatalogoData;

function texto(valor: unknown, max = 120): string {
  return typeof valor === "string" ? valor.trim().slice(0, max) : "";
}

function numero(valor: unknown): number | null {
  return typeof valor === "number" && Number.isFinite(valor) ? valor : null;
}

export async function POST(req: NextRequest) {
  let body: SolicitudCotizacionInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const sistema = catalogo.paneles.find((p) => p.proveedor === body?.proveedor);
  if (!sistema) {
    return NextResponse.json({ error: "Ese proveedor no existe." }, { status: 400 });
  }

  const solicitante = {
    nombre: texto(body.solicitante?.nombre, 100),
    telefono: texto(body.solicitante?.telefono, 30),
    municipio: texto(body.solicitante?.municipio, 100),
  };
  const errores = validarSolicitante(
    { ...solicitante, consentimiento: body.consentimiento === true },
    sistema.proveedor
  );
  if (Object.keys(errores).length > 0) {
    return NextResponse.json(
      { error: "Revisa los datos del formulario.", errores },
      { status: 400 }
    );
  }

  // En producción una solicitud sin dónde guardarse se perdería: mejor avisar.
  // En desarrollo enviarAHoja la registra en consola para poder probar.
  const faltantes = variablesHojaFaltantes();
  if (process.env.NODE_ENV === "production" && faltantes.length > 0) {
    console.error(`[cotizaciones] falta configurar: ${faltantes.join(", ")}`);
    return NextResponse.json({ error: "No pudimos guardar tu solicitud" }, { status: 500 });
  }

  const registro = {
    id: crypto.randomUUID(),
    fecha: new Date().toISOString(),
    sessionId: texto(body.sessionId, 64),
    proveedor: sistema.proveedor,
    estadoDatos: sistema.estadoDatos,
    solicitante,
    consentimiento: true,
    estado: "nueva",
  };
  const negocio = body.negocio ?? {};
  const estimado = body.estimado ?? {};

  // Orden de columnas de la hoja "solicitudes" (ver docs/hoja-google.md).
  const ok = await enviarAHoja("solicitudes", [
    registro.id,
    registro.fecha,
    registro.sessionId,
    registro.proveedor,
    registro.estadoDatos,
    solicitante.nombre,
    solicitante.telefono,
    solicitante.municipio,
    registro.consentimiento,
    texto(negocio.tipo, 30),
    texto(negocio.region, 30),
    texto(negocio.horario, 30),
    Array.isArray(negocio.noPuedeFallar)
      ? negocio.noPuedeFallar.map((v) => texto(v, 30)).join(", ")
      : "",
    texto(negocio.comoFalla, 30),
    texto(negocio.constituido, 30),
    numero(estimado.consumoKwh),
    numero(estimado.valorFactura),
    numero(estimado.kwp),
    numero(estimado.ahorroMensual),
    numero(estimado.inversion),
    numero(estimado.retornoMeses),
    registro.estado,
    texto(negocio.departamento, 40),
    sistema.planes?.find((p) => p.nombre === body.plan)?.nombre ?? "",
  ]);

  if (!ok) {
    console.error("[cotizaciones] no se pudo guardar la solicitud", registro.id);
    return NextResponse.json(
      { error: "No pudimos enviar tu solicitud. Intenta de nuevo en unos minutos." },
      { status: 502 }
    );
  }

  return NextResponse.json({ id: registro.id }, { status: 201 });
}
